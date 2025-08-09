'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'

type Stats = {
  date: string
  total_points_earned_today: number
  total_points_redeemed_today: number
  net_points_today: number
  sales_count: number
  sales_subtotal_today: number
  sales_total_today: number
}

type Daily = {
  date: string
  earned: number
  redeemed: number
  sales_total: number
  sales_count: number
}

type TopRow = { phone: string; name: string | null; balance: number }

export default function DashboardHome({ baseUrl }: { baseUrl: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [daily, setDaily] = useState<Daily[]>([])
  const [top, setTop] = useState<TopRow[]>([])
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setErr(null)
    try {
      const [s, d, t] = await Promise.all([
        fetch(`${baseUrl}/api/stats`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`${baseUrl}/api/stats/daily?range=30`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`${baseUrl}/api/stats/top`, { cache: 'no-store' }).then(r => r.json()),
      ])

      if (s.error) throw new Error(s.error)
      if (d.error) throw new Error(d.error)
      if (t.error) throw new Error(t.error)

      setStats(s)
      setDaily(d.days || [])
      setTop(t.topBalances || [])
    } catch (e:any) {
      setErr(e.message || 'Error cargando dashboard')
    }
  }

  useEffect(() => { load() }, [])

  const kpi = useMemo(() => ([
    { label: 'Puntos ganados hoy', value: stats?.total_points_earned_today ?? 0 },
    { label: 'Puntos canjeados hoy', value: stats?.total_points_redeemed_today ?? 0 },
    { label: 'Puntos netos hoy', value: stats?.net_points_today ?? 0 },
    { label: 'Ventas (hoy)', value: stats?.sales_count ?? 0 },
    { label: 'Subtotal hoy (MXN)', value: stats?.sales_subtotal_today ?? 0, money: true },
    { label: 'Total hoy (MXN)', value: stats?.sales_total_today ?? 0, money: true },
  ]), [stats])

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Panel - Laboratorio</h1>
          <p className="text-gray-500">Resumen diario de puntos y ventas</p>
        </header>

        {err && <div className="mb-4 text-red-600 font-medium">Error: {err}</div>}

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {kpi.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border">
              <div className="text-xs text-gray-500">{c.label}</div>
              <div className="text-2xl font-bold mt-1">
                {c.money ? ('$' + Number(c.value).toFixed(2)) : Number(c.value).toFixed(2)}
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Ventas últimos 30 días</h3>
              <span className="text-xs text-gray-400">Total diario</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }}/>
                  <YAxis tick={{ fontSize: 12 }}/>
                  <Tooltip />
                  <Area type="monotone" dataKey="sales_total" stroke="#16a34a" fillOpacity={1} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Top saldos</h3>
              <span className="text-xs text-gray-400">Top 5</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phone" tick={{ fontSize: 10 }}/>
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="balance" name="Saldo" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Link className="px-4 py-3 rounded-xl bg-white border shadow-sm hover:bg-gray-100 text-center" href="/admin">Registrar venta</Link>
          <Link className="px-4 py-3 rounded-xl bg-white border shadow-sm hover:bg-gray-100 text-center" href="/puntos">Consultar saldo</Link>
          <Link className="px-4 py-3 rounded-xl bg-white border shadow-sm hover:bg-gray-100 text-center" href="/canjear">Canjear puntos</Link>
          <Link className="px-4 py-3 rounded-xl bg-white border shadow-sm hover:bg-gray-100 text-center" href="/admin/historial">Historial de paciente</Link>
          <Link className="px-4 py-3 rounded-xl bg-white border shadow-sm hover:bg-gray-100 text-center" href="/admin/pacientes">Lista de pacientes</Link>
        </section>
      </div>
    </main>
  )
}
