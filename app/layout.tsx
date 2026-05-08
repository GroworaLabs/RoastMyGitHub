import type { Metadata } from 'next'
import { Instrument_Serif, JetBrains_Mono, Geist } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RoastMyGitHub — An Editorial Takedown of Your Code',
  description: 'Enter your GitHub username. Receive a brutally accurate, literary-magazine-style roast of your coding habits, repos, and dev persona.',
  openGraph: {
    title: 'RoastMyGitHub',
    description: 'An AI editorial roast of your GitHub profile.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoastMyGitHub',
    description: 'An AI editorial roast of your GitHub profile.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme !== 'light') document.documentElement.classList.add('dark');
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${instrumentSerif.variable} ${jetbrainsMono.variable} ${geist.variable}`}
      >
        {children}
      </body>
    </html>
  )
}
