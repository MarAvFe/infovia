'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { fetchActiveReports, Report } from '../lib/reports'
import { fetchFallbackCondition } from '../lib/openmeteo'
import { Condition } from '../lib/weathercode'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

const MAP_CENTER = { lat: 9.9281, lng: -84.0907 }
const STALE_MS = 10 * 60 * 1000

type FallbackPin = { lat: number; lng: number; condition: Condition }

export default function MapView() {
  const [reports, setReports] = useState<Report[]>([])
  const [fallbackPin, setFallbackPin] = useState<FallbackPin | null>(null)
  const [loading, setLoading] = useState(true)
  const [stale, setStale] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const lastFetchRef = useRef<number>(0)
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function load() {
    setLoading(true)
    setStale(false)
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current)

    try {
      const data = await fetchActiveReports()
      setReports(data)
      lastFetchRef.current = Date.now()

      if (data.length === 0) {
        const condition = await fetchFallbackCondition(MAP_CENTER.lat, MAP_CENTER.lng)
        setFallbackPin({ lat: MAP_CENTER.lat, lng: MAP_CENTER.lng, condition })
      } else {
        setFallbackPin(null)
      }
    } catch {
      // keep existing state on error
    } finally {
      setLoading(false)
    }

    staleTimerRef.current = setTimeout(() => setStale(true), STALE_MS)
  }

  useEffect(() => {
    const stored = localStorage.getItem('raincheck_user_location')
    if (stored) {
      try {
        setUserLocation(JSON.parse(stored))
      } catch {
        // ignore parse error
      }
    }
  }, [])

  useEffect(() => {
    load()
    return () => { if (staleTimerRef.current) clearTimeout(staleTimerRef.current) }
  }, [])

  return (
    <div className="relative h-screen w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <p className="text-gray-500">Cargando reportes...</p>
        </div>
      )}

      {!loading && reports.length === 0 && fallbackPin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2 rounded-lg shadow">
          Sin reportes recientes. Mostrando pronóstico del clima.
        </div>
      )}

      <LeafletMap
        reports={reports}
        fallbackPin={fallbackPin}
        userLocation={userLocation}
        stale={stale}
        loading={loading}
        onRefresh={load}
      />
    </div>
  )
}
