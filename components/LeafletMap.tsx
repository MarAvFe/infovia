'use client'

import 'leaflet/dist/leaflet.css'
import { Fragment, useState, useEffect, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Report, Condition, submitFeedback } from '../lib/reports'

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

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type FallbackPin = { lat: number; lng: number; condition: Condition }

type Props = {
  reports: Report[]
  fallbackPin: FallbackPin | null
  userLocation: { lat: number; lng: number } | null
  stale: boolean
  loading: boolean
  lastFetchTime: number
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

export default function LeafletMap({ reports, fallbackPin, userLocation, stale, loading, lastFetchTime, onRefresh }: Props) {
  const mapCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER

  const [minutesSince, setMinutesSince] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    if (!lastFetchTime) return
    const update = () => setMinutesSince(Math.floor((Date.now() - lastFetchTime) / 60000))
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [lastFetchTime])

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  async function handleContactSubmit(e: FormEvent) {
    e.preventDefault()
    if (!contactMessage.trim()) return
    setContactStatus('sending')
    try {
      await submitFeedback(contactMessage.trim())
      setContactStatus('sent')
      setContactMessage('')
    } catch {
      setContactStatus('error')
    }
  }

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: '¿Necesitás capa?', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // user cancelled share dialog
    }
  }

  return (
    <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', alignItems: 'flex-end', flexDirection: 'column', gap: 6 }}>
        {!stale && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, color: '#6b7280', backgroundColor: 'white', padding: '2px 6px', borderRadius: 999, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
              {minutesSince === 0 ? 'justo ahora' : `hace ${minutesSince} min`}
            </div>
            <div style={{ backgroundColor: '#22c55e', color: 'white', fontSize: 12, padding: '2px 8px', borderRadius: 999 }}>
              En vivo
            </div>
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

      {/* Info button — bottom right, lower edge level with the legend's lower edge */}
      <button
        onClick={() => setShowHelp(true)}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 16,
          zIndex: 1000,
          backgroundColor: '#2563eb',
          border: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          color: 'white',
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 14px',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        ℹ️ Info
      </button>

      {showHelp && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px 16px 0 0',
              padding: '20px 20px 28px',
              maxWidth: 480,
              width: '100%',
              maxHeight: '65vh',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
              boxSizing: 'border-box',
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', fontSize: 17, color: '#1f2937' }}>
                Acerca de Baldazo
              </div>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Cerrar"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  color: '#6b7280',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: '#374151' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2, color: '#1f2937' }}>🔒 Es anónimo</div>
                <div>Guardamos tu ubicación aproximada, no tu nombre ni ningún dato personal. Nadie puede identificarte a partir de un reporte.</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2, color: '#1f2937' }}>💸 Es gratis</div>
                <div>Baldazo es gratuito y no tiene anuncios. Funciona porque la comunidad reporta.</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2, color: '#1f2937' }}>⏱️ Reportes recientes</div>
                <div>Los reportes se muestran en el mapa por 45 minutos y luego desaparecen de la vista en vivo.</div>
              </div>
            </div>

            <button
              onClick={handleShare}
              style={{
                marginTop: 18,
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                color: '#1d4ed8',
                fontSize: 14,
                fontWeight: 600,
                padding: '12px 16px',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copiado' : '↑ Compartir Baldazo'}
            </button>

            {!installed && installPrompt && (
              <button
                onClick={handleInstall}
                style={{
                  marginTop: 18,
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '12px 16px',
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
              >
                📲 Instalar en mi teléfono
              </button>
            )}
            {!installed && !installPrompt && (
              <div
                style={{
                  marginTop: 18,
                  width: '100%',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: 13,
                  padding: '12px 16px',
                  borderRadius: 12,
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              >
                📲 Instalá la app desde el menú de tu navegador: buscá &quot;Agregar a inicio&quot; o &quot;Instalar app&quot;.
              </div>
            )}
            {installed && (
              <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                ✓ Ya instalada
              </div>
            )}

            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #e5e7eb' }}>
              {!showContactForm && (
                <button
                  onClick={() => setShowContactForm(true)}
                  style={{
                    width: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '12px 16px',
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  ✉️ Contactanos
                </button>
              )}

              {showContactForm && (
                <form onSubmit={handleContactSubmit}>
                  <div style={{ fontSize: 13, color: '#111827', marginBottom: 8 }}>
                    Contanos qué pasó o qué podríamos mejorar.
                  </div>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Escribí tu mensaje aquí..."
                    rows={3}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      padding: 8,
                      fontSize: 14,
                      color: '#111827',
                      resize: 'none',
                      boxSizing: 'border-box',
                      marginBottom: 8,
                    }}
                    disabled={contactStatus === 'sending' || contactStatus === 'sent'}
                  />
                  {contactStatus === 'error' && (
                    <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>
                      No se pudo enviar. Intentá de nuevo.
                    </p>
                  )}
                  {contactStatus === 'sent' && (
                    <p style={{ color: '#16a34a', fontSize: 12, marginBottom: 8 }}>
                      ¡Gracias! Recibimos tu mensaje.
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowContactForm(false)
                        setContactStatus('idle')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: 13,
                        padding: '8px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      disabled={contactStatus === 'sending' || contactStatus === 'sent' || !contactMessage.trim()}
                      style={{
                        backgroundColor: '#2563eb',
                        border: 'none',
                        color: 'white',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '8px 14px',
                        borderRadius: 999,
                        cursor: contactStatus === 'sending' ? 'not-allowed' : 'pointer',
                        opacity: contactStatus === 'sending' || contactStatus === 'sent' || !contactMessage.trim() ? 0.5 : 1,
                      }}
                    >
                      {contactStatus === 'sending' ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

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
        const time = new Date(r.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
        return (
          <Fragment key={r.id}>
            <CircleMarker
              center={[r.lat, r.lng]}
              radius={40}
              pathOptions={{ fillColor: PIN_COLORS[r.condition], fillOpacity: 0.8, stroke: false }}
            />
            <Marker position={[r.lat, r.lng]} icon={createEmojiIcon(EMOJIS[r.condition])}>
              <Popup>{time}</Popup>
            </Marker>
          </Fragment>
        )
      })}

      {/* Fallback pin */}
      {fallbackPin && (
        <Fragment>
          <CircleMarker
            center={[fallbackPin.lat, fallbackPin.lng]}
            radius={40}
            pathOptions={{ fillColor: PIN_COLORS[fallbackPin.condition], fillOpacity: 0.5, stroke: false }}
          >
            <Tooltip permanent>Pronóstico</Tooltip>
          </CircleMarker>
          <Marker position={[fallbackPin.lat, fallbackPin.lng]} icon={createEmojiIcon(EMOJIS[fallbackPin.condition])} />
        </Fragment>
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
