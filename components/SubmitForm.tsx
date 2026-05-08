'use client'

import { useState, useEffect } from 'react'
import { fuzzLocation } from '../lib/fuzz'
import { submitReport } from '../lib/reports'
import { Condition } from '../lib/weathercode'

type Props = { onSuccess: () => void }

type GeoState = 'loading' | 'denied' | 'blocked' | 'ready'

const CONDITIONS: { condition: Condition; label: string }[] = [
  { condition: 'rain', label: 'Sí, necesito capa' },
  { condition: 'cloudy', label: 'Está nublado' },
  { condition: 'clear', label: 'No, está despejado' },
]

const CONDITION_COLORS: Record<Condition, string> = {
  rain: 'bg-blue-500 hover:bg-blue-600 text-white',
  cloudy: 'bg-gray-400 hover:bg-gray-500 text-white',
  clear: 'bg-amber-400 hover:bg-amber-500 text-white',
}

export default function SubmitForm({ onSuccess }: Props) {
  const [geoState, setGeoState] = useState<GeoState>('loading')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function requestLocation(isRetry = false) {
    setGeoState('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoState('ready')
      },
      (err) => {
        console.log('Geolocation error:', err.code, err.message)
        setGeoState(isRetry ? 'blocked' : 'denied')
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
    )
  }

  useEffect(() => { requestLocation() }, [])

  async function handleCondition(condition: Condition) {
    if (!coords || submitting) return
    setSubmitting(true)
    setError(null)
    localStorage.setItem('raincheck_user_location', JSON.stringify(coords))
    const fuzzed = fuzzLocation(coords.lat, coords.lng)
    try {
      await submitReport(fuzzed.lat, fuzzed.lng, condition)
      onSuccess()
    } catch {
      setError('Error al enviar. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¿Está lloviendo ahora?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Contanos si donde estás ahora, está lloviendo.
          </p>
        </div>

        {geoState === 'loading' && (
          <p className="text-gray-400 text-sm">Obteniendo ubicación...</p>
        )}

        {geoState === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-red-700">
              Esta app funciona si todos aportamos. Necesitamos tu ubicación para registrar tu reporte.
            </p>
            <button
              onClick={() => requestLocation(true)}
              className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Permitir ubicación
            </button>
          </div>
        )}

        {geoState === 'blocked' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-red-700 font-medium">Ubicación bloqueada por el navegador</p>
            <p className="text-sm text-red-600">
              Para activarla: tocá el ícono 🔒 en la barra de dirección → <strong>Permisos del sitio</strong> → <strong>Ubicación</strong> → Permitir. Luego recargá la página.
            </p>
            <button
              onClick={() => requestLocation(true)}
              className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {geoState === 'ready' && (
          <div className="space-y-3">
            {CONDITIONS.map(({ condition, label }) => (
              <button
                key={condition}
                onClick={() => handleCondition(condition)}
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-medium transition-colors disabled:opacity-50 ${CONDITION_COLORS[condition]}`}
              >
                {submitting ? 'Enviando...' : label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}
