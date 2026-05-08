import { LRUCache } from 'lru-cache'

export interface RecentRoast {
  username: string
  firstLine: string
  timestamp: number
}

// In-memory store — keeps the last 20, serves last 5
const store = new LRUCache<string, RecentRoast>({
  max: 20,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
})

export function addRecentRoast(username: string, firstLine: string) {
  store.set(username.toLowerCase(), {
    username,
    firstLine: firstLine.slice(0, 120),
    timestamp: Date.now(),
  })
}

export function getRecentRoasts(): RecentRoast[] {
  return [...store.values()]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
}
