import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
// import { notifyWhatsApp } from '@/lib/notify'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const rawPhone: string = (body.phone ?? '').toString()
    const phone = rawPhone.replace(/\D/g, '').slice(0, 10)
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Teléfono inválido (10 dígitos)' }, { status: 400 })
    }

    const first_name = (body.first_name ?? 'Paciente').toString().trim()
    const last_name = (body.last_name ?? '').toString().trim()
    const folio = (body.folio ?? '').toString().trim()

    const subtotalNum = Number(body.subtotal)
    const discountNum = Number(body.discount ?? 0)
    if (!Number.isFinite(subtotalNum) || subtotalNum <= 0) {
      return NextResponse.json({ error: 'Subtotal inválido' }, { status: 400 })
    }
    if (!Number.isFinite(discountNum) || discountNum < 0) {
      return NextResponse.json({ error: 'Descuento inválido' }, { status: 400 })
    }

    // Paciente (schema 'rewards' viene del cliente)
    const up = await supabaseAdmin
      .from('patients')
      .upsert({ phone, first_name, last_name }, { onConflict: 'phone' })
      .select('*')
      .single()
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 })
    const patient = up.data!

    // Transacción
    const ins = await supabaseAdmin
      .from('transactions')
      .insert({ patient_id: patient.id, subtotal: subtotalNum, discount: discountNum, folio })
      .select('*')
      .single()
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 })
    const tx = ins.data!

    // Regla activa
    let percent = 10
    const ruleq = await supabaseAdmin
      .from('accrual_rules')
      .select('percent')
      .eq('is_active', true)
      .order('starts_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!ruleq.error && ruleq.data?.percent != null) percent = Number(ruleq.data.percent)

    const totalNum = Number((tx as any).total) || 0
    const points = Math.round((totalNum * percent / 100) * 100) / 100

    // Ledger
    const led = await supabaseAdmin
      .from('point_ledger')
      .insert({ patient_id: patient.id, transaction_id: (tx as any).id, type: 'earn', points, reason: `Acumulación ${percent}%` })
    if (led.error) return NextResponse.json({ error: led.error.message }, { status: 500 })

    // Saldo
    const sal = await supabaseAdmin
      .from('v_patient_points')
      .select('balance')
      .eq('phone', phone)
      .maybeSingle()

    return NextResponse.json({ ok: true, earned_points: points, balance: Number(sal.data?.balance ?? points), transaction: tx })
  } catch (e: any) {
    console.error('transactions POST fatal:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Error procesando la transacción' }, { status: 500 })
  }
}
