import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await supabaseServer()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('study_sessions')
    .select('id, started_at, ended_at, duration_sec')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Timer sends one object: { duration_sec: number }
    const body = await req.json()

console.log('Received session body:', body)
console.log('Received duration_sec:', body.duration_sec)
console.log('Type:', typeof body.duration_sec)

    const durationSec = Number(body.duration_sec)

    if (!Number.isInteger(durationSec) || durationSec <= 0) {
      return NextResponse.json(
        { error: 'Invalid session duration' },
        { status: 400 }
      )
    }

    const endedAt = new Date()
    const startedAt = new Date(
      endedAt.getTime() - durationSec * 1000
    )

    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        duration_sec: durationSec,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Session insert error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, session: data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Session API error:', error)

    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}