import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(_: Request, ctx: { params: { phone: string } }) {
  try {
    const phone = (ctx.params.phone || '').toString().replace(/\D/g, '').slice(0, 10)
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Teléfono inválido (10 dígitos)' }, { status: 400 })
    }

    const res = await supabaseAdmin
      .from('v_patient_points')
      .select('phone, balance')
      .eq('phone', phone)
      .maybeSingle()

    if (res.error) throw new Error(res.error.message)

    return NextResponse.json({
      phone,
      balance: Number(res.data?.balance ?? 0)
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
