import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type LeaderboardRow = {
  user_id: string
  name: string
  total_sec: number | string
  rank: number | string
}

const noCache = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function GET(request: Request) {
  try {
    const supabase = await supabaseServer()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: noCache }
      )
    }

    const params = new URL(request.url).searchParams
    const parsedOffset = Number(params.get('tz') ?? 0)
    const offset = Number.isFinite(parsedOffset) ? parsedOffset : 0

    // Run all dashboard data queries together after authenticating once.
    const [profileResult, statsResult, leaderboardResult, sessionsResult] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .maybeSingle(),

        // Keep the same source table and calculation basis as /api/stats.
        supabase
          .from('sessions')
          .select('id,started_at,duration_sec')
          .order('started_at', { ascending: false })
          .limit(1000),

        supabase.rpc('get_weekly_leaderboard'),

        // Keep the same source table and columns as /api/sessions GET.
        supabase
          .from('study_sessions')
          .select('id, started_at, ended_at, duration_sec')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false }),
      ])

    if (sessionsResult.error) {
      console.error('Dashboard sessions query failed:', sessionsResult.error)
      return NextResponse.json(
        { error: 'Failed to load study sessions' },
        { status: 500, headers: noCache }
      )
    }

    if (statsResult.error) {
      console.error('Dashboard stats query failed:', statsResult.error)
    }

    if (leaderboardResult.error) {
      console.error('Dashboard leaderboard RPC failed:', leaderboardResult.error)
    }

    const rows = statsResult.data ?? []
    const dayKey = (value: string | number) =>
      new Date(new Date(value).getTime() - offset * 60000)
        .toISOString()
        .slice(0, 10)

    const totalsByDay: Record<string, number> = {}
    for (const row of rows) {
      const key = dayKey(row.started_at)
      totalsByDay[key] = (totalsByDay[key] ?? 0) + Number(row.duration_sec || 0)
    }

    const now = Date.now()
    const today = dayKey(now)
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = dayKey(now - (6 - index) * 86400000)
      return { date, sec: totalsByDay[date] ?? 0 }
    })

    let streak = 0
    for (let daysAgo = totalsByDay[today] ? 0 : 1; totalsByDay[dayKey(now - daysAgo * 86400000)]; daysAgo++) {
      streak++
    }

    const stats = {
      todaySec: totalsByDay[today] ?? 0,
      todaySessions: rows.filter((row) => dayKey(row.started_at) === today),
      week,
      weekSec: week.reduce((sum, item) => sum + item.sec, 0),
      streak,
      totalSec: rows.reduce((sum, row) => sum + Number(row.duration_sec || 0), 0),
      totalSessions: rows.length,
    }

    const leaderboardRows = (leaderboardResult.data ?? []) as LeaderboardRow[]
    const entries = leaderboardRows
      .filter((row) => Number(row.rank) <= 10)
      .map((row) => ({
        user_id: row.user_id,
        name: row.name,
        total_sec: Number(row.total_sec),
      }))

    const currentRow = leaderboardRows.find((row) => row.user_id === user.id)
    const current = currentRow
      ? {
          user_id: currentRow.user_id,
          name: currentRow.name,
          rank: Number(currentRow.rank),
          total_sec: Number(currentRow.total_sec),
        }
      : null

    const leaderboard = {
      entries,
      current,
      available: !leaderboardResult.error,
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: profileResult.data?.name ?? 'there',
        },
        stats,
        top: entries,
        leaderboard,
        sessions: sessionsResult.data ?? [],
      },
      { status: 200, headers: noCache }
    )
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: noCache }
    )
  }
}
