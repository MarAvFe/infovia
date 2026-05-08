import { ImageResponse } from 'next/og'

export const alt = '¿Hay Baldazo? — El mapa de lluvia para motociclistas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#2563eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        padding: 60,
      }}
    >
      {/* Raindrop shape */}
      <div
        style={{
          width: 80,
          height: 100,
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
          marginBottom: 40,
          display: 'flex',
        }}
      />
      <div style={{ fontSize: 72, fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>
        ¿Hay Baldazo?
      </div>
      <div style={{ fontSize: 30, marginTop: 28, opacity: 0.85, textAlign: 'center', maxWidth: 700 }}>
        El mapa de lluvia para motociclistas de San José
      </div>
    </div>,
    { ...size }
  )
}
