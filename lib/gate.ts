const KEY = 'baldazo_last_report'
export const STALE_MS = 10 * 60 * 1000

export function hasRecentReport(): boolean {
  const ts = localStorage.getItem(KEY)
  if (!ts) return false
  return Date.now() - parseInt(ts, 10) < STALE_MS
}

export function markReported(): void {
  localStorage.setItem(KEY, Date.now().toString())
}
