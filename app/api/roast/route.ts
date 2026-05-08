import { NextRequest, NextResponse } from 'next/server'
import { fetchGitHubDossier } from '@/lib/github'
import { streamRoast } from '@/lib/claude'
import { checkRateLimit } from '@/lib/ratelimit'
import { checkGlobalLimit } from '@/lib/globalLimit'
import { getCachedRoast, setCachedRoast } from '@/lib/roastCache'
import { addRecentRoast } from '@/lib/recentRoasts'

export const runtime = 'nodejs'
export const maxDuration = 60

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

function makeSSEStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  // Stream cached roast back as a single SSE event so client handles it identically
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}

export async function POST(req: NextRequest) {
  // 1. Parse + validate username
  let username: string
  try {
    const body = await req.json()
    username = (body.username as string)?.trim().replace(/^@/, '')
    if (!username || !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return NextResponse.json({ error: 'Invalid GitHub username.' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // 2. Username cache — no Claude call needed
  const cached = await getCachedRoast(username)
  if (cached) {
    return new Response(makeSSEStream(cached), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Cache': 'HIT',
      },
    })
  }

  // 3. Per-IP rate limit
  const ip = getIp(req)
  const { allowed: ipAllowed, resetIn } = checkRateLimit(ip)
  if (!ipAllowed) {
    const minutes = Math.ceil(resetIn / 60000)
    return NextResponse.json(
      {
        error: `Even our critics need a moment between issues. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      },
      { status: 429 }
    )
  }

  // 4. Global daily cap
  const { allowed: globalAllowed } = checkGlobalLimit()
  if (!globalAllowed) {
    return NextResponse.json(
      {
        error: 'The editorial desk has reached its daily quota. We resume tomorrow.',
      },
      { status: 429 }
    )
  }

  // 5. GitHub fetch
  let dossier
  try {
    dossier = await fetchGitHubDossier(username)
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 404) {
      return NextResponse.json(
        { error: 'This developer does not exist. Or has impeccable opsec.' },
        { status: 404 }
      )
    }
    console.error('GitHub fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch GitHub profile.' }, { status: 502 })
  }

  // 6. Stream Claude — intercept to cache + record recent
  const roastStream = await streamRoast(dossier)
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let fullText = ''

  const intercepted = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const raw = decoder.decode(chunk, { stream: true })
      for (const line of raw.split('\n')) {
        if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
          try {
            const { text } = JSON.parse(line.slice(6))
            fullText += text
          } catch { /* ignore */ }
        }
      }
      controller.enqueue(chunk)
    },
    flush() {
      if (fullText.length > 100) {
        setCachedRoast(username, fullText).catch(() => {})
        addRecentRoast(username, fullText.slice(0, 120))
      }
    },
  })

  return new Response(roastStream.pipeThrough(intercepted), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Cache': 'MISS',
    },
  })
}
