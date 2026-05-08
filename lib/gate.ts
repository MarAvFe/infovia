const KEY = 'raincheck_reported'

export function hasReported(): boolean {
  return localStorage.getItem(KEY) === 'true'
}

export function markReported(): void {
  localStorage.setItem(KEY, 'true')
}
