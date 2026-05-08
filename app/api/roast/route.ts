import { NextRequest, NextResponse } from 'next/server'
import { fetchGitHubDossier } from '@/lib/github'
import { streamRoast } from '@/lib/claude'
import { checkRateLimit } from '@/lib/ratelimit'
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

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const { allowed, resetIn } = checkRateLimit(ip)

  if (!allowed) {
    const minutes = Math.ceil(resetIn / 60000)
    return NextResponse.json(
      {
        error: `Even our critics need a moment between issues. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      },
      { status: 429 }
    )
  }

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

  let dossier
  try {
    dossier = await fetchGitHubDossier(username)
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 404) {
      return NextResponse.json(
        {
          error:
            'This developer does not exist. Or has impeccable opsec.',
        },
        { status: 404 }
      )
    }
    console.error('GitHub fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch GitHub profile.' }, { status: 502 })
  }

  // Stream the roast
  const roastStream = await streamRoast(dossier)

  // Intercept the stream to capture the first line for recent roasts
  let firstLine = ''
  let firstLineCaptured = false
  const decoder = new TextDecoder()

  const intercepted = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      if (!firstLineCaptured) {
        const text = decoder.decode(chunk, { stream: true })
        firstLine += text
        const match = firstLine.match(/data: ({.*?})\n/)
        if (match) {
          try {
            const parsed = JSON.parse(match[1])
            if (parsed.text && parsed.text.length > 20) {
              addRecentRoast(username, parsed.text)
              firstLineCaptured = true
            }
          } catch {
            // ignore
          }
        }
      }
      controller.enqueue(chunk)
    },
  })

  const responseStream = roastStream.pipeThrough(intercepted)

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Username': username,
    },
  })
}
