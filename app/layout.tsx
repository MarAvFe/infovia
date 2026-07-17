import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: 'Baldazo',
  description: 'El mapa de lluvia para motociclistas de San José. ¿Hay baldazo en tu ruta? Reportá y chequeá el mapa.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
