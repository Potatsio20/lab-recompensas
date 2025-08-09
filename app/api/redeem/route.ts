import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

/**
 * POST /api/redeem
 * Body: { phone: string, points: number, reason?: string, folio?: string }
 * Efecto: registra un canje en rewards.point_ledger con puntos NEGATIVOS
 * y devuelve el saldo actualizado desde rewards.v_patient_points.
 */
export async function POST(req: Request) {
  try {
    const { phone, points, reason, folio } = await req.json()

    const clean = (phone || '').toString().replace(/\D/g,'').slice(0,10)
    if (!/^\d{10}$/.test(clean)) {
      return NextResponse.json({ error: 'Teléfono inválido (10 dígitos)' }, { status: 400 })
    }

    const pts = Number(points)
    if (!Number.isFinite(pts) || pts <= 0) {
      return NextResponse.json({ error: 'Puntos inválidos' }, { status: 400 })
    }

    // 1) Paciente
    const pat = await supabaseAdmin.from('patients').select('id').eq('phone', clean).maybeSingle()
    if (pat.error) return NextResponse.json({ error: pat.error.message }, { status: 500 })
    if (!pat.data) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })

    // 2) Saldo actual
    const prev = await supabaseAdmin.from('v_patient_points').select('balance').eq('phone', clean).maybeSingle()
    if (prev.error) return NextResponse.json({ error: prev.error.message }, { status: 500 })
    const prevBalance = Number(prev.data?.balance ?? 0)

    if (prevBalance < pts) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // 3) Insertar movimiento NEGATIVO
    const fullReason = (reason || 'Canje de puntos') + (folio ? ` (Folio: ${folio})` : '')
    const ins = await supabaseAdmin.from('point_ledger').insert({
      patient_id: pat.data.id,
      type: 'redeem',
      points: -Math.abs(pts),  // <--- NEGATIVO
      reason: fullReason
    })
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 })

    // 4) Recalcular saldo DESPUÉS del canje para devolver el valor real
    const post = await supabaseAdmin.from('v_patient_points').select('balance').eq('phone', clean).maybeSingle()
    if (post.error) return NextResponse.json({ error: post.error.message }, { status: 500 })
    const newBalance = Number(post.data?.balance ?? 0)

    return NextResponse.json({
      ok: true,
      redeemed: pts,
      previous_balance: prevBalance,
      balance: newBalance
    })
  } catch (e: any) {
    console.error('redeem POST error:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Error procesando el canje' }, { status: 500 })
  }
}
