import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const today = new Date()
    const y = today.getUTCFullYear()
    const m = String(today.getUTCMonth() + 1).padStart(2, '0')
    const d = String(today.getUTCDate()).padStart(2, '0')
    const isoDay = `${y}-${m}-${d}`

    const earnQ = await supabaseAdmin.from('point_ledger')
      .select('points')
      .gte('created_at', `${isoDay}T00:00:00Z`)
      .lte('created_at', `${isoDay}T23:59:59Z`)
      .eq('type', 'earn')
    if (earnQ.error) throw new Error(earnQ.error.message)
    const total_points_earned_today =
      (earnQ.data ?? []).reduce((s: number, r: any) => s + Number(r.points || 0), 0)

    const redeemQ = await supabaseAdmin.from('point_ledger')
      .select('points')
      .gte('created_at', `${isoDay}T00:00:00Z`)
      .lte('created_at', `${isoDay}T23:59:59Z`)
      .eq('type', 'redeem')
    if (redeemQ.error) throw new Error(redeemQ.error.message)
    const total_points_redeemed_today = Math.abs(
      (redeemQ.data ?? []).reduce((s: number, r: any) => s + Number(r.points || 0), 0)
    )

    const txQ = await supabaseAdmin.from('transactions')
      .select('subtotal, total')
      .gte('created_at', `${isoDay}T00:00:00Z`)
      .lte('created_at', `${isoDay}T23:59:59Z`)
    if (txQ.error) throw new Error(txQ.error.message)
    const sales = txQ.data ?? []
    const sales_count = sales.length
    const sales_subtotal_today = sales.reduce((s: number, t: any) => s + Number(t.subtotal || 0), 0)
    const sales_total_today = sales.reduce((s: number, t: any) => s + Number(t.total || 0), 0)

    return NextResponse.json({
      date: isoDay,
      total_points_earned_today,
      total_points_redeemed_today,
      net_points_today: total_points_earned_today - total_points_redeemed_today,
      sales_count,
      sales_subtotal_today,
      sales_total_today,
    })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 })
  }
}
