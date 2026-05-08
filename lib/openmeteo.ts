import { weathercodeToCondition, Condition } from './weathercode'

export async function fetchFallbackCondition(lat: number, lng: number): Promise<Condition> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    )
    const data = await res.json()
    return weathercodeToCondition(data.current_weather.weathercode)
  } catch {
    return 'cloudy'
  }
}
