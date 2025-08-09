// pages/api/stats.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Usa las variables de entorno ya definidas en .env.local
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  // Lanzar no es ideal en runtime; devolvemos 500 legible
  // eslint-disable-next-line no-console
  console.error('Faltan variables: SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = SUPABASE_URL && SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'rewards' } })
  : null

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase no configurado (revisa .env.local)' })
    }

    // Fecha de hoy en UTC (YYYY-MM-DD)
    const today = new Date()
    const y = today.getUTCFullYear()
    const m = String(today.getUTCMonth() + 1).padStart(2, '0')
    const d = String(today.getUTCDate()).padStart(2, '0')
    const isoDay = `${y}-${m}-${d}`

    // Earn hoy
    const earnQ = await supabase
      .from('point_ledger')
      .select('points')
      .gte('created_at', `${isoDay}T00:00:00Z`)
      .lte('created_at', `${isoDay}T23:59:59Z`)
      .eq('type', 'earn')
    if (earnQ.error) throw new Error('earnQ: ' + earnQ.error.message)
    const total_points_earned_today = (earnQ.data ?? []).reduce((s: number, r: any) => s + Number(r.points || 0), 0)

    // Redeem hoy
    const redeemQ = await supabase
      .from('point_ledger')
      .select('points')
      .gte('created_at', `${isoDay}T00:00:00Z`)
      .lte('created_at', `${isoDay}T23:59:59Z`)
      .eq('type', 'redeem')
    if (redeemQ.error) throw new Error('redeemQ: ' + redeemQ.error.message)
    const total_points_redeemed_today = Math.abs((redeemQ.data ?? []).reduce((s: number, r: any) => s + Number(r.points || 0), 0))

    // Ventas hoy
    const txQ = await supabase
      .from('transactions')
      .select('subtotal, total')
      .gte('created_at', `${isoDay}T00:00:00Z`)
      .lte('created_at', `${isoDay}T23:59:59Z`)
    if (txQ.error) throw new Error('txQ: ' + txQ.error.message)
    const sales = txQ.data ?? []
    const sales_count = sales.length
    const sales_subtotal_today = sales.reduce((s: number, t: any) => s + Number(t.subtotal || 0), 0)
    const sales_total_today = sales.reduce((s: number, t: any) => s + Number(t.total || 0), 0)

    return res.status(200).json({
      date: isoDay,
      total_points_earned_today,
      total_points_redeemed_today,
      net_points_today: total_points_earned_today - total_points_redeemed_today,
      sales_count,
      sales_subtotal_today,
      sales_total_today,
    })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Error' })
  }
}
