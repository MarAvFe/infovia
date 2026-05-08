export type Condition = 'rain' | 'cloudy' | 'clear'

export function weathercodeToCondition(code: number): Condition {
  if (code === 0) return 'clear'
  if (code >= 1 && code <= 3) return 'cloudy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rain'
  return 'cloudy'
}
