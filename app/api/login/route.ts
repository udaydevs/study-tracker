import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const sb = await supabaseServer()
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  return NextResponse.json({ ok: true })
}
export async function DELETE() { // logout
  const sb = await supabaseServer()
  await sb.auth.signOut()
  return NextResponse.json({ ok: true })
}
