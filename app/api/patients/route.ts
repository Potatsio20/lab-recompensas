import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  const { phone, first_name, last_name } = await req.json()
  const clean = (phone || '').toString().replace(/\D/g,'').slice(0,10)
  if (!/^\d{10}$/.test(clean)) return NextResponse.json({ error: 'Teléfono inválido (10 dígitos)' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('patients')
    .upsert({ phone: clean, first_name, last_name }, { onConflict: 'phone' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ patient: data })
}
