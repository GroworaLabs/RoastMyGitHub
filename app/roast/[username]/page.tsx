import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import RoastVerdict from '@/components/RoastVerdict'
import { fetchGitHubDossier } from '@/lib/github'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmygithub.com'
  return {
    title: `@${username} — RoastMyGitHub`,
    description: `An AI editorial takedown of @${username}'s GitHub profile.`,
    openGraph: {
      title: `@${username} — Roasted`,
      description: `An AI editorial takedown of @${username}'s GitHub profile.`,
      url: `${siteUrl}/roast/${username}`,
      images: [{ url: `${siteUrl}/roast/${username}/opengraph-image` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `@${username} — Roasted on RoastMyGitHub`,
    },
  }
}

export default async function RoastPage({ params }: Props) {
  const { username } = await params

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    notFound()
  }

  let dossier
  try {
    dossier = await fetchGitHubDossier(username)
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 404) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-lg">
            <p className="section-marker mb-4">§ 404</p>
            <h1 className="font-serif italic text-5xl mb-4">
              This developer does not exist.
            </h1>
            <p className="font-serif text-xl mb-8" style={{ color: 'var(--fg-muted)' }}>
              Or has impeccable opsec.
            </p>
            <a href="/" className="mono-label underline hover:text-[var(--crimson)]">
              ← Return to the desk
            </a>
          </div>
        </div>
      )
    }
    throw err
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)]">
        <a href="/" className="mono-label hover:text-[var(--crimson)] transition-colors">
          ← ROASTMYGITHUB
        </a>
        <ThemeToggle />
      </nav>

      <main className="flex-1">
        <RoastVerdict username={username} dossier={dossier} />
      </main>

      <footer className="px-6 py-6 border-t border-[var(--border)]">
        <p className="mono-label">ROASTMYGITHUB — NO DATA STORED EXCEPT CACHE</p>
      </footer>
    </div>
  )
}
