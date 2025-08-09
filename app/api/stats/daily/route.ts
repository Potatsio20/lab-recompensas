import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = Math.max(7, Math.min(90, Number(searchParams.get('range') || 30)))

    const since = new Date(); since.setDate(since.getDate() - (range - 1))
    const isoSince = since.toISOString().slice(0,10)

    const [ledger, tx] = await Promise.all([
      supabaseAdmin.from('point_ledger').select('created_at, points, type').gte('created_at', `${isoSince}T00:00:00Z`),
      supabaseAdmin.from('transactions').select('created_at, total').gte('created_at', `${isoSince}T00:00:00Z`),
    ])
    if (ledger.error) throw new Error(ledger.error.message)
    if (tx.error) throw new Error(tx.error.message)

    const days: Record<string, { earned:number; redeemed:number; sales_total:number; sales_count:number }> = {}
    for (let i=0;i<range;i++){ const d = new Date(since); d.setDate(since.getDate()+i); days[d.toISOString().slice(0,10)] = { earned:0, redeemed:0, sales_total:0, sales_count:0 } }

    for (const r of (ledger.data ?? [])) {
      const date = new Date(r.created_at).toISOString().slice(0,10)
      if (!days[date]) continue
      if (r.type === 'earn') days[date].earned += Number(r.points||0)
      if (r.type === 'redeem') days[date].redeemed += Math.abs(Number(r.points||0))
    }
    for (const r of (tx.data ?? [])) {
      const date = new Date(r.created_at).toISOString().slice(0,10)
      if (!days[date]) continue
      days[date].sales_total += Number(r.total||0)
      days[date].sales_count += 1
    }

    const out = Object.entries(days).map(([date, v]) => ({ date, ...v }))
    return NextResponse.json({ days: out })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 })
  }
}
