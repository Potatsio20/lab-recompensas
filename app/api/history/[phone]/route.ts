import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(_: Request, { params }: { params: { phone: string } }) {
  try {
    const phone = (params.phone || '').toString().replace(/\D/g,'').slice(0,10)
    if (!/^\d{10}$/.test(phone)) return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 })

    const pat = await supabaseAdmin.from('patients').select('*').eq('phone', phone).maybeSingle()
    if (pat.error) return NextResponse.json({ error: pat.error.message }, { status: 500 })

    const bal = await supabaseAdmin.from('v_patient_points').select('balance').eq('phone', phone).maybeSingle()
    if (bal.error) return NextResponse.json({ error: bal.error.message }, { status: 500 })

    const tx = await supabaseAdmin
      .from('transactions')
      .select('id, folio, subtotal, discount, total, created_at')
      .order('created_at', { ascending: false })
      .eq('patient_id', pat.data?.id)
      .limit(50)

    const ledger = await supabaseAdmin
      .from('point_ledger')
      .select('id, type, points, reason, transaction_id, created_at')
      .order('created_at', { ascending: false })
      .eq('patient_id', pat.data?.id)
      .limit(100)

    if (tx.error) return NextResponse.json({ error: tx.error.message }, { status: 500 })
    if (ledger.error) return NextResponse.json({ error: ledger.error.message }, { status: 500 })

    const redeems = (ledger.data ?? []).filter((l:any)=>l.type==='redeem')

    return NextResponse.json({
      patient: pat.data,
      balance: Number(bal.data?.balance ?? 0),
      transactions: tx.data ?? [],
      ledger: ledger.data ?? [],
      redeems
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
