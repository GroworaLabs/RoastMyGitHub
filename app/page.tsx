import HeroInput from '@/components/HeroInput'
import ThemeToggle from '@/components/ThemeToggle'
import type { RecentRoast } from '@/lib/recentRoasts'

async function getRecentRoasts(): Promise<RecentRoast[]> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${siteUrl}/api/recent`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function Home() {
  const recent = await getRecentRoasts()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        className="flex justify-between items-center px-8 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="mono-label">ROASTMYGITHUB</span>
        <div className="flex items-center gap-8">
          <span className="mono-label" style={{ color: 'var(--crimson)' }}>VOL. I — NO. 01</span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero grid */}
      <main className="flex-1 md:grid" style={{ gridTemplateColumns: '1fr 1px 1fr' }}>

        {/* Left column */}
        <div className="px-8 py-14 flex flex-col justify-between">
          <div>
            {/* Kicker */}
            <p className="mono-label mb-10">AN EDITORIAL TAKEDOWN OF YOUR CODE</p>

            {/* Big headline */}
            <h1
              className="font-serif italic"
              style={{ fontSize: 'clamp(5.5rem, 11vw, 9rem)', lineHeight: 0.88, letterSpacing: '-0.01em' }}
            >
              ROAST
            </h1>
            <p
              className="font-serif"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', color: 'var(--fg-muted)', marginTop: '0.4rem' }}
            >
              my GitHub
            </p>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '2.5rem 0' }} />

            {/* Lede */}
            <p
              className="font-serif"
              style={{ fontSize: '1.125rem', lineHeight: 1.75, color: 'var(--fg-muted)', maxWidth: '42ch' }}
            >
              A brutally honest literary takedown of your coding habits,
              dead repos, and the gap between who you say you are and
              what your commits reveal.
            </p>
          </div>

          {/* Input */}
          <div className="mt-12">
            <p className="mono-label mb-4">ENTER YOUR GITHUB USERNAME</p>
            <HeroInput />
          </div>
        </div>

        {/* Column rule */}
        <div className="hidden md:block" style={{ background: 'var(--border)' }} />

        {/* Right column */}
        <div className="px-8 py-14 flex flex-col justify-between md:border-t-0" style={{ borderTop: '1px solid var(--border)' }}>

          {/* Editorial credentials */}
          <div>
            <p className="mono-label mb-8">FROM THE EDITOR</p>
            <blockquote
              className="pull-quote"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', borderLeftWidth: '3px' }}
            >
              "We have reviewed your repositories. The commits speak for themselves —
              and they are not speaking well."
            </blockquote>
            <p className="mono-label mt-6">— CLAUDE, CRITIC-IN-CHIEF</p>

            <div style={{ height: '1px', background: 'var(--border)', margin: '2.5rem 0' }} />

            {/* What gets analysed */}
            <p className="mono-label mb-5">WHAT WE EXAMINE</p>
            <ul className="space-y-2">
              {[
                'Public repositories & star counts',
                'Commit message quality & frequency',
                'Language-hopping patterns',
                'Dead repos (last push 2+ years)',
                'README authenticity',
                'The gap between bio and reality',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: 'var(--crimson)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '0.2rem', flexShrink: 0 }}>§</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent victims */}
          {recent.length > 0 ? (
            <div className="mt-10">
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />
              <p className="mono-label mb-4">RECENT VICTIMS</p>
              <div className="space-y-3">
                {recent.map(r => (
                  <a
                    key={r.username}
                    href={`/roast/${r.username}`}
                    className="block"
                    style={{ padding: '0.75rem', border: '1px solid var(--border)' }}
                  >
                    <p className="mono-label mb-1" style={{ color: 'var(--crimson)' }}>@{r.username}</p>
                    <p
                      className="font-serif"
                      style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {r.firstLine}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />
              <p className="mono-label mb-2">NO VICTIMS YET</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--fg-muted)' }}>
                Be the first to submit to the editorial process.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="flex justify-between items-center px-8 py-4 flex-wrap gap-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="mono-label">© ROASTMYGITHUB — NO DATA STORED EXCEPT CACHE</p>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mono-label hover-crimson"
        >
          X / TWITTER
        </a>
      </footer>
    </div>
  )
}
