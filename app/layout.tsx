import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RainCheck',
  description: 'Reportá el clima. Chequeá el mapa.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
