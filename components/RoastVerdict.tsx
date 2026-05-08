'use client'

import { useEffect, useRef, useState } from 'react'
import type { GitHubDossier } from '@/lib/github'
import { extractPullQuote } from '@/lib/extractPullQuote'
import PullQuote from './PullQuote'
import StatsCard from './StatsCard'
import ShareButtons from './ShareButtons'
import TerminalLoader from './TerminalLoader'

interface Props {
  username: string
  dossier: GitHubDossier
}

const DOSSIER_NUMBER = () =>
  String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')

export default function RoastVerdict({ username, dossier }: Props) {
  const [roastText, setRoastText] = useState('')
  const [streaming, setStreaming] = useState(true)
  const [error, setError] = useState('')
  const [dossierNum] = useState(() => DOSSIER_NUMBER())
  const [elapsed, setElapsed] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    let buffer = ''

    async function fetchRoast() {
      try {
        const res = await fetch('/api/roast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Something went wrong.')
          setStreaming(false)
          return
        }

        const reader = res.body?.getReader()
        if (!reader) return

        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6).trim()
              if (payload === '[DONE]') {
                setStreaming(false)
                setElapsed(Math.round((Date.now() - startRef.current) / 100) / 10)
                break
              }
              try {
                const { text } = JSON.parse(payload)
                buffer += text
                setRoastText(buffer)
              } catch {
                // ignore malformed
              }
            }
          }
        }
      } catch (err) {
        console.error(err)
        setError('The editorial process encountered an unexpected obstruction.')
        setStreaming(false)
      }
    }

    fetchRoast()
  }, [username])

  const paragraphs = roastText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)

  const pullQuote = !streaming && roastText ? extractPullQuote(roastText) : ''

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <p className="section-marker mb-4">§ ERROR</p>
          <h1 className="font-serif italic text-4xl mb-4">{error}</h1>
          <a href="/" className="mono-label underline">← Return to the desk</a>
        </div>
      </div>
    )
  }

  if (streaming && !roastText) {
    return <TerminalLoader username={username} />
  }

  return (
    <div className="min-h-screen px-6 py-16 max-w-6xl mx-auto">
      {/* Kicker */}
      <div className="mb-8 flex items-center gap-6">
        <span className="section-marker">DOSSIER № {dossierNum}</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="mono-label">EDITORIAL REVIEW</span>
      </div>

      {/* Name */}
      <div className="mb-2">
        <h1
          className="font-serif italic"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.95 }}
        >
          @{dossier.name ?? username}
        </h1>
        {dossier.name && (
          <p className="mono-label mt-2">@{username}</p>
        )}
      </div>

      {/* Byline */}
      <p className="mono-label mt-4 mb-10">
        By Claude. Critic-in-Chief.{' '}
        {!streaming && elapsed > 0
          ? `Composed in ${elapsed}s.`
          : 'Composing...'}
      </p>

      <div className="h-px bg-[var(--border)] mb-10" />

      {/* Two-column layout */}
      <div
        ref={cardRef}
        className="grid gap-10"
        style={{ gridTemplateColumns: '1fr 280px' }}
      >
        {/* Left: roast prose */}
        <div>
          <div className="roast-prose">
            {paragraphs.map((para, i) => (
              <p key={i} className={i === 0 ? 'drop-cap' : ''}>
                {para}
                {streaming && i === paragraphs.length - 1 && (
                  <span className="cursor-blink">▋</span>
                )}
              </p>
            ))}
          </div>

          {/* Pull quote */}
          {pullQuote && !streaming && (
            <div className="mt-12">
              <div className="h-px bg-[var(--border)] mb-10" />
              <PullQuote text={pullQuote} />
            </div>
          )}

          {/* Share */}
          {!streaming && (
            <div className="mt-12">
              <div className="h-px bg-[var(--border)] mb-6" />
              <p className="mono-label mb-4">SHARE THE VERDICT</p>
              <ShareButtons username={username} cardRef={cardRef} />
            </div>
          )}
        </div>

        {/* Right: stats sidebar */}
        <div className="hidden md:block">
          <StatsCard d={dossier} />
        </div>
      </div>

      {/* Mobile stats */}
      <div className="md:hidden mt-10 pt-10 border-t border-[var(--border)]">
        <StatsCard d={dossier} />
      </div>
    </div>
  )
}
