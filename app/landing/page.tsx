import Link from 'next/link'

export const metadata = {
  title: 'Hay Baldazo — El mapa de lluvia para motociclistas',
  description: 'El mapa de lluvia para motociclistas. Reportá el clima donde estás y chequeá cómo está la ruta.',
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">
        <div className="text-6xl mb-6">🪣🌧️</div>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight max-w-xs">
          ¿Hay baldazo en tu ruta?
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-sm">
          Hay Baldazo es el mapa de lluvia para motociclistas de San José. Lo construimos entre todos.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block bg-blue-600 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors"
        >
          Reportar ahora →
        </Link>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-12">
        <h2 className="text-center text-xl font-bold text-gray-800 mb-8">¿Cómo funciona?</h2>
        <div className="max-w-sm mx-auto space-y-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📍</div>
            <div>
              <p className="font-semibold text-gray-800">1. Reportás donde estás</p>
              <p className="text-sm text-gray-500 mt-1">Abrís la app, compartís tu ubicación y decís si está lloviendo donde estás ahora.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-3xl">🗺️</div>
            <div>
              <p className="font-semibold text-gray-800">2. Ves el mapa completo</p>
              <p className="text-sm text-gray-500 mt-1">Al reportar, desbloqueás el mapa con los reportes de toda la comunidad en tiempo real.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤝</div>
            <div>
              <p className="font-semibold text-gray-800">3. Todos ganamos</p>
              <p className="text-sm text-gray-500 mt-1">Cuantos más reporten, mejor el mapa. Sin cuentas, sin registro, totalmente anónimo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">El Waze de la lluvia</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Ninguna app de clima sabe si hay baldazo en tu esquina exacta. Pero un moto que pasó hace 10 minutos sí lo sabe. Hay Baldazo convierte esa información en algo útil para todos.
          </p>
        </div>
      </section>

      {/* CTA footer */}
      <section className="bg-blue-600 px-6 py-12 text-center mt-auto">
        <p className="text-white text-lg font-semibold mb-4">Sumate a la comunidad</p>
        <Link
          href="/"
          className="inline-block bg-white text-blue-600 text-base font-bold px-8 py-3 rounded-2xl hover:bg-blue-50 transition-colors"
        >
          Hacer mi primer reporte
        </Link>
      </section>

    </main>
  )
}
