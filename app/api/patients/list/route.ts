import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = (url.searchParams.get('q') || '').trim()
    const limit = Number(url.searchParams.get('limit') || '50')

    // Base select de pacientes (SIN tocar id/uuid)
    let sel = supabaseAdmin
      .from('patients')
      .select('phone, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100))

    if (q) {
      const isDigits = /^\d+$/.test(q)
      if (isDigits) {
        sel = sel.ilike('phone', `%${q}%`)
      } else {
        // Buscar en nombre y apellidos
        sel = sel.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      }
    }

    const patientsRes = await sel
    if (patientsRes.error) throw new Error(patientsRes.error.message)

    const rows = patientsRes.data ?? []
    const phones = rows.map(r => r.phone).filter(Boolean)

    // Traer balances desde la vista v_patient_points (por teléfono)
    let balances: Record<string, number> = {}
    if (phones.length) {
      const balRes = await supabaseAdmin
        .from('v_patient_points')
        .select('phone, balance')
        .in('phone', phones)

      if (balRes.error) throw new Error(balRes.error.message)
      for (const r of balRes.data || []) {
        balances[r.phone] = Number(r.balance || 0)
      }
    }

    const out = rows.map(r => ({
      phone: r.phone,
      name: [r.first_name, r.last_name].filter(Boolean).join(' ') || null,
      balance: balances[r.phone] ?? 0,
      created_at: r.created_at
    }))

    return NextResponse.json({ rows: out })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
