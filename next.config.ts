import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Required for streaming in app router
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
