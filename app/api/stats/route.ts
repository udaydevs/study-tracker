import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const sb = await supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const off = Number(new URL(req.url).searchParams.get('tz') || 0) // minutes, from Date.getTimezoneOffset()
  const { data } = await sb.from('sessions').select('id,started_at,duration_sec')
    .order('started_at', { ascending: false }).limit(1000)
  const rows = data ?? []
  const day = (d: string | number) => new Date(new Date(d).getTime() - off * 60000).toISOString().slice(0, 10)
  const by: Record<string, number> = {}
  rows.forEach((r) => { const k = day(r.started_at); by[k] = (by[k] || 0) + r.duration_sec })
  const now = Date.now(), today = day(now)
  const week = [...Array(7)].map((_, i) => { const k = day(now - (6 - i) * 864e5); return { date: k, sec: by[k] || 0 } })
  let streak = 0
  for (let i = by[today] ? 0 : 1; by[day(now - i * 864e5)]; i++) streak++
  return NextResponse.json({
    todaySec: by[today] || 0,
    todaySessions: rows.filter((r) => day(r.started_at) === today),
    week, weekSec: week.reduce((a, d) => a + d.sec, 0), streak,
    totalSec: rows.reduce((a, r) => a + r.duration_sec, 0),
    totalSessions: rows.length,
  })
}
