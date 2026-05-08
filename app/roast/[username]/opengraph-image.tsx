import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RoastMyGitHub — Editorial Takedown'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ username: string }>
}

export default async function OGImage({ params }: Props) {
  const { username } = await params

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#f5f1e8',
          padding: '60px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #d4cfc6',
            paddingBottom: '24px',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b6460',
            }}
          >
            ROASTMYGITHUB — EDITORIAL REVIEW
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#c41e3a',
            }}
          >
            DOSSIER
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              fontSize: '16px',
              fontFamily: 'monospace',
              color: '#6b6460',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px',
            }}
          >
            THE SUBJECT
          </div>
          <h1
            style={{
              fontSize: '96px',
              fontStyle: 'italic',
              lineHeight: 0.9,
              color: '#0a0a0a',
              margin: 0,
            }}
          >
            @{username}
          </h1>
          <div
            style={{
              marginTop: '32px',
              borderLeft: '4px solid #c41e3a',
              paddingLeft: '24px',
              fontSize: '28px',
              fontStyle: 'italic',
              color: '#1a1a1a',
              maxWidth: '900px',
            }}
          >
            "The gap between aspiration and output, measured in commits."
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: '1px solid #d4cfc6',
            paddingTop: '24px',
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#6b6460',
            }}
          >
            roastmygithub.com
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#c41e3a',
              textTransform: 'uppercase',
            }}
          >
            BY CLAUDE — CRITIC-IN-CHIEF
          </span>
        </div>
      </div>
    ),
    size
  )
}
