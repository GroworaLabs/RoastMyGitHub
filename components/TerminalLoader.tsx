'use client'

import { useEffect, useState } from 'react'

const LINES = [
  '> fetching public profile...',
  '> cataloguing repositories...',
  '> reading commit messages...',
  '> analysing language distribution...',
  '> counting dead repos...',
  '> auditing README quality...',
  '> cross-referencing starred repos with self-image...',
  '> detecting "initial commit" patterns...',
  '> measuring gap between aspiration and output...',
  '> summoning the critic...',
]

export default function TerminalLoader({ username }: { username: string }) {
  const [lines, setLines] = useState<string[]>([LINES[0]])

  useEffect(() => {
    let i = 1
    const id = setInterval(() => {
      if (i < LINES.length) {
        setLines(prev => [...prev, LINES[i]])
        i++
      } else {
        clearInterval(id)
      }
    }, 600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto py-16 px-4">
      <p className="mono-label mb-6">COMPILING DOSSIER ON @{username.toUpperCase()}</p>
      <div className="space-y-1 overflow-hidden" style={{ maxHeight: '320px' }}>
        {lines.map((line, i) => (
          <div
            key={i}
            className="terminal-line font-mono text-sm"
            style={{ animationDelay: `${i * 0}ms` }}
          >
            <span style={{ color: 'var(--crimson)' }}>
              {i === lines.length - 1 ? '▋' : '✓'}
            </span>{' '}
            <span className="opacity-70">{line}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <p className="font-serif italic text-2xl opacity-40">EDITORIAL IN PROGRESS</p>
      </div>
    </div>
  )
}
