import { LRUCache } from 'lru-cache'

const TTL_SECONDS = 60 * 60 // 1 hour

// In-memory fallback
const memCache = new LRUCache<string, string>({
  max: 500,
  ttl: TTL_SECONDS * 1000,
})

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  // Lazy import to avoid crashing when env vars are missing
  const { Redis } = require('@upstash/redis')
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function getCachedRoast(username: string): Promise<string | null> {
  const key = `roast:${username.toLowerCase()}`
  const redis = getRedis()
  if (redis) {
    try {
      const val = await redis.get(key)
      if (typeof val === 'string') return val
    } catch {
      // fall through to memory cache
    }
  }
  return memCache.get(key) ?? null
}

export async function setCachedRoast(username: string, text: string): Promise<void> {
  const key = `roast:${username.toLowerCase()}`
  const redis = getRedis()
  if (redis) {
    try {
      await redis.set(key, text, { ex: TTL_SECONDS })
    } catch {
      // fall through to memory cache
    }
  }
  memCache.set(key, text)
}
