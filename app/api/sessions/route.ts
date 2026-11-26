import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Accepts a batch so the offline queue can sync in one request. Upsert by id = safe to retry.
export async function POST(req: Request) {
  const sb = await supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = (await req.json()) as { id: string; started_at: string; duration_sec: number }[]
  const { error } = await sb.from('sessions').upsert(
    rows.map((r) => ({ id: r.id, started_at: r.started_at, duration_sec: r.duration_sec, user_id: user.id })),
    { onConflict: 'id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
