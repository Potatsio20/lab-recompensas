import './globals.css'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Sistema de puntos',
  description: 'Panel de laboratorio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        {/* Header global */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="text-lg font-bold">Sistema de puntos</div>
            <Nav />
          </div>
        </header>

        {/* Contenido */}
        {children}
      </body>
    </html>
  )
}
