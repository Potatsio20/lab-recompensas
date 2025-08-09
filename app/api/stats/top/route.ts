import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const bal = await supabaseAdmin
      .from('v_patient_points')
      .select('phone, balance')
      .order('balance', { ascending: false })
      .limit(5)
    if (bal.error) throw new Error(bal.error.message)

    const phones = (bal.data ?? []).map((r:any)=>r.phone)
    let names: Record<string, string|null> = {}
    if (phones.length) {
      const pat = await supabaseAdmin
        .from('patients')
        .select('phone, first_name, last_name')
        .in('phone', phones)
      if (pat.error) throw new Error(pat.error.message)
      for (const p of (pat.data ?? [])) names[p.phone] = [p.first_name, p.last_name].filter(Boolean).join(' ') || null
    }

    const topBalances = (bal.data ?? []).map((r:any)=>({ phone: r.phone, name: names[r.phone] ?? null, balance: Number(r.balance || 0) }))
    return NextResponse.json({ topBalances })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 })
  }
}
