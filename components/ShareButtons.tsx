'use client'

import { useRef } from 'react'
import { toPng } from 'html-to-image'

interface Props {
  username: string
  cardRef: React.RefObject<HTMLDivElement | null>
}

export default function ShareButtons({ username, cardRef }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roastmygithub.com'
  const roastUrl = `${siteUrl}/roast/${username}`

  const tweetText = encodeURIComponent(
    `I just got destroyed by an AI on @RoastMyGitHub. Worst part: it was right. ${roastUrl}`
  )
  const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}`

  async function downloadPostcard() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        width: 1200,
        height: 1500,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      })
      const link = document.createElement('a')
      link.download = `roast-${username}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to capture image:', err)
    }
  }

  return (
    <div className="flex gap-4 flex-wrap">
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-roast"
      >
        TWEET THIS
      </a>
      <button onClick={downloadPostcard} className="btn-roast">
        DOWNLOAD AS POSTCARD
      </button>
    </div>
  )
}
