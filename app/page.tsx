'use client'

import { Clock3, Medal, Users } from 'lucide-react'
import Header from '@/components/Header'
import DashboardTimer from '@/components/dashboard-timer'
import { useStudyData } from '@/lib/useStudyData'
import { hm } from '@/lib/format'
import type { StudySession } from '@/lib/study-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type SessionRowProps = { session: StudySession }

function SessionRow({ session }: SessionRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 border-t py-3 text-sm">
      <span className="text-[#777187]">
        {new Date(session.started_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </span>
      <span className="font-semibold tabular-nums">{hm(session.duration_sec)}</span>
    </li>
  )
}

export default function Timer() {
  const { user, stats, leaderboard, sessions = [], loading } = useStudyData()

  async function saveSession(sec: number) {
    const durationSec = Math.floor(Number(sec))
    if (!Number.isFinite(durationSec) || durationSec <= 0) return
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_sec: durationSec }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save session')
      window.dispatchEvent(new Event('st:synced'))
    } catch (error) {
      console.error('Error saving study session:', error)
    }
  }

  if (!user) {
    return <main className="mx-auto grid min-h-[70vh] w-full max-w-7xl place-items-center px-4 py-8 text-sm text-[#777187]">{loading ? 'Loading your dashboard…' : 'Unable to load dashboard.'}</main>
  }

  const today = new Date().toDateString()
  const todaySessions = sessions
    .filter((session) => new Date(session.started_at).toDateString() === today)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
  const entries = leaderboard?.entries ?? []
  const current = leaderboard?.current

  return (
    <main className="min-h-screen bg-[#f8f7fb]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header name={user.name} streak={stats?.streak ?? 0} page="home" />

        <section className="mb-8 mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#777187]">Focus workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Make time count.</h1>
            <p className="mt-2 max-w-lg text-sm text-[#777187]">A calm place to focus, track your sessions, and build consistency.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3">
            <Clock3 className="size-4 text-[#6b3fd8]" />
            <div><p className="text-xs text-[#777187]">Today's focus</p><p className="text-lg font-semibold tabular-nums">{stats ? hm(stats.todaySec) : '—'}</p></div>
          </div>
        </section>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.85fr)]">
          <Card className="min-h-[520px]">
            <CardHeader className="text-center">
              <CardTitle className="text-base">Focus timer</CardTitle>
              <CardDescription>Start a session and give one task your full attention.</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-8 px-5 sm:px-8">
              <DashboardTimer onStop={saveSession} />
              <p className="max-w-md text-center text-xs leading-relaxed text-[#777187]">Your completed focus sessions are saved to your study history and analytics.</p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div><CardDescription>Daily progress</CardDescription><CardTitle className="mt-1">Today's sessions</CardTitle></div>
                <span className="grid size-9 place-items-center rounded-lg bg-[#6b3fd8]/10 text-[#6b3fd8]"><Clock3 className="size-4" /></span>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#f0edf5]/60 p-3"><p className="text-2xl font-semibold tabular-nums">{loading ? '—' : todaySessions.length}</p><p className="mt-1 text-xs text-[#777187]">sessions</p></div>
                  <div className="rounded-lg bg-[#f0edf5]/60 p-3"><p className="text-2xl font-semibold tabular-nums">{stats ? hm(stats.todaySec) : '—'}</p><p className="mt-1 text-xs text-[#777187]">study time</p></div>
                </div>
                {loading ? <p className="py-4 text-sm text-[#777187]">Loading sessions…</p> : todaySessions.length ? (
                  <ul>{todaySessions.slice(0, 5).map((session) => <SessionRow key={session.id} session={session} />)}</ul>
                ) : <div className="rounded-lg border border-dashed p-4 text-sm text-[#777187]">Your first completed session will appear here.</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div><CardDescription>This week</CardDescription><CardTitle className="mt-1">Leaderboard</CardTitle></div>
                <span className="grid size-9 place-items-center rounded-lg bg-[#6b3fd8]/10 text-[#6b3fd8]"><Medal className="size-4" /></span>
              </CardHeader>
              <CardContent>
                {entries.length ? <ol className="space-y-1">{entries.slice(0, 5).map((entry, index) => <li key={entry.user_id} className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm ${entry.user_id === user.id ? 'bg-[#6b3fd8]/10 text-[#6b3fd8]' : ''}`}><span className="w-5 text-center text-xs text-[#777187]">{index + 1}</span><span className="min-w-0 flex-1 truncate font-medium">{entry.name}{entry.user_id === user.id ? ' · you' : ''}</span><strong className="tabular-nums">{hm(entry.total_sec)}</strong></li>)}</ol> : <div className="flex items-start gap-2 rounded-lg border border-dashed p-4 text-sm text-[#777187]"><Users className="mt-0.5 size-4 shrink-0" />Leaderboard data will appear as users complete sessions.</div>}
                {current && <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm"><span className="text-[#777187]">Your position</span><strong>{current.rank ? `#${current.rank}` : 'Not ranked'} · {hm(current.total_sec)}</strong></div>}
                <Button variant="outline" className="mt-4 w-full" onClick={() => window.location.assign('/dashboard')}>View full analytics</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
