import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const sb = await supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await sb.from('profiles').select('name').eq('id', user.id).single()
  return NextResponse.json({ id: user.id, email: user.email, name: p?.name ?? 'there' })
}
