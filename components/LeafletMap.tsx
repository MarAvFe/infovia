'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Report, Condition } from '../lib/reports'

const PIN_COLORS: Record<Condition, string> = {
  rain: '#3B82F6',
  cloudy: '#6B7280',
  clear: '#F59E0B',
}

const EMOJIS: Record<Condition, string> = {
  rain: '🌧️',
  cloudy: '☁️',
  clear: '☀️',
}

type FallbackPin = { lat: number; lng: number; condition: Condition }

type Props = {
  reports: Report[]
  fallbackPin: FallbackPin | null
  userLocation: { lat: number; lng: number } | null
  stale: boolean
  loading: boolean
  onRefresh: () => void
}

const DEFAULT_CENTER: [number, number] = [9.9281, -84.0907]

function createEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size: 24px; line-height: 1; filter: drop-shadow(0 0 2px white) drop-shadow(0 0 2px white);">${emoji}</div>`,
    iconSize: [24, 24],
    className: 'emoji-icon',
  })
}

export default function LeafletMap({ reports, fallbackPin, userLocation, stale, loading, onRefresh }: Props) {
  const mapCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER

  return (
    <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8 }}>
        {!stale && !loading && (
          <div style={{ backgroundColor: '#22c55e', color: 'white', fontSize: 12, padding: '2px 8px', borderRadius: 999 }}>
            En vivo
          </div>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            border: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            color: 'white',
            fontSize: 15,
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: 999,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          ↻ Refrescar
        </button>
      </div>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 20,
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '14px',
          color: '#1f2937',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Leyenda</div>
        <div>🌧️ Capa requerida</div>
        <div>☁️ Nublado</div>
        <div>☀️ Despejado</div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#374151' }}>📍 Tu ubicación</div>
      </div>

      {/* Community reports */}
      {reports.map((r) => {
        const time = new Date(r.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        return (
          <div key={r.id}>
            <CircleMarker
              center={[r.lat, r.lng]}
              radius={40}
              pathOptions={{ fillColor: PIN_COLORS[r.condition], fillOpacity: 0.8, stroke: false }}
            >
              <Tooltip>{time}</Tooltip>
            </CircleMarker>
            <Marker position={[r.lat, r.lng]} icon={createEmojiIcon(EMOJIS[r.condition])} />
          </div>
        )
      })}

      {/* Fallback pin */}
      {fallbackPin && (
        <div>
          <CircleMarker
            center={[fallbackPin.lat, fallbackPin.lng]}
            radius={40}
            pathOptions={{ fillColor: PIN_COLORS[fallbackPin.condition], fillOpacity: 0.5, stroke: false }}
          >
            <Tooltip permanent>Pronóstico</Tooltip>
          </CircleMarker>
          <Marker position={[fallbackPin.lat, fallbackPin.lng]} icon={createEmojiIcon(EMOJIS[fallbackPin.condition])} />
        </div>
      )}

      {/* User location marker (rendered last so it's on top) */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={L.icon({
          iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233B82F6"><circle cx="12" cy="12" r="8"/></svg>',
          iconSize: [16, 16],
        })}>
          <Popup>Tu ubicación</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
