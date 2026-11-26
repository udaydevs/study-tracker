import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()
  const sb = await supabaseServer()
  const { error } = await sb.auth.signUp({ email, password, options: { data: { name } } })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
