'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroInput() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function validate(v: string) {
    return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(v)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = value.trim().replace(/^@/, '')
    if (!clean) {
      setError('Enter a GitHub username.')
      return
    }
    if (!validate(clean)) {
      setError('That doesn\'t look like a valid GitHub username.')
      return
    }
    setError('')
    router.push(`/roast/${clean}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex items-baseline gap-0">
        <span className="mono-label mr-2 shrink-0">@</span>
        <input
          ref={inputRef}
          type="text"
          className="editorial-input flex-1"
          placeholder="username"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={39}
        />
      </div>
      {error && (
        <p className="mono-label mt-2 text-[var(--crimson)]">{error}</p>
      )}
      <div className="mt-8">
        <button type="submit" className="btn-roast">
          ROAST ME
        </button>
      </div>
    </form>
  )
}
