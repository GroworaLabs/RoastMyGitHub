import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, string>({
  max: 500,
  ttl: 60 * 60 * 1000, // 1 hour
})

export function getCachedRoast(username: string): string | undefined {
  return cache.get(username.toLowerCase())
}

export function setCachedRoast(username: string, text: string) {
  cache.set(username.toLowerCase(), text)
}
