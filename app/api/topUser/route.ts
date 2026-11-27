
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

export async function GET() {
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

    const { data, error } = await supabase.rpc(
      'get_weekly_leaderboard'
    )

    if (error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch leaderboard',
          ...(process.env.NODE_ENV === 'development' && {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          }),
        },
        {
          status: 500,
          headers: noCache,
        }
      )
    }

    const rows = (data ?? []) as LeaderboardRow[]

    const entries = rows
      .filter((row) => Number(row.rank) <= 10)
      .map((row) => ({
        user_id: row.user_id,
        name: row.name,
        total_sec: Number(row.total_sec),
      }))

    const currentRow = rows.find(
      (row) => row.user_id === user.id
    )

    const current = currentRow
      ? {
          rank: Number(currentRow.rank),
          total_sec: Number(currentRow.total_sec),
        }
      : null

    return NextResponse.json(
      {
        entries,
        current,
        available: true,
      },
      {
        status: 200,
        headers: noCache,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          message:
            error instanceof Error
              ? error.message
              : String(error),
        }),
      },
      {
        status: 500,
        headers: noCache,
      }
    )
  }
}
