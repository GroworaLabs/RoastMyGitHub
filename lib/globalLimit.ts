// Hard daily cap — resets at midnight UTC
const DAILY_MAX = 300

let count = 0
let resetDate = todayUTC()

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function checkGlobalLimit(): { allowed: boolean; remaining: number } {
  const today = todayUTC()
  if (today !== resetDate) {
    count = 0
    resetDate = today
  }
  if (count >= DAILY_MAX) {
    return { allowed: false, remaining: 0 }
  }
  count++
  return { allowed: true, remaining: DAILY_MAX - count }
}

export function getDailyCount(): number {
  return count
}
