'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/',                label: 'Registrar venta' },
  { href: '/puntos',          label: 'Consultar saldo' },
  { href: '/canjear',         label: 'Canjear puntos' },
  { href: '/admin/historial', label: 'Historial' },
  { href: '/admin/pacientes', label: 'Lista de pacientes' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map(link => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              'rounded-xl border px-3 py-1.5 text-sm transition',
              active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'hover:bg-gray-50 border-gray-200 text-gray-700',
            ].join(' ')}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
