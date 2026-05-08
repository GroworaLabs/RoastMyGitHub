import { LRUCache } from 'lru-cache'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory fallback — fine for MVP on a single Vercel instance
const cache = new LRUCache<string, RateLimitEntry>({
  max: 5000,
  ttl: 60 * 60 * 1000, // 1 hour
})

const LIMIT = 2
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = `rl:${ip}`
  const entry = cache.get(key)

  if (!entry || now > entry.resetAt) {
    cache.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: LIMIT - 1, resetIn: WINDOW_MS }
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, remaining: LIMIT - entry.count, resetIn: entry.resetAt - now }
}
