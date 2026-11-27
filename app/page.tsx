
'use client'

import { useEffect, useState } from 'react'
import { Clock3, Medal, Users } from 'lucide-react'

import Header from '@/components/Header'
import DashboardTimer from '@/components/dashboard-timer'
import { useStudyData } from '@/lib/useStudyData'
import { hm } from '@/lib/format'
import type { StudySession } from '@/lib/study-types'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'

type SessionRowProps = {
  session: StudySession
}

function SessionRow({ session }: SessionRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-border py-3 text-sm">
      <span className="text-muted-foreground">
        {new Date(session.started_at).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </span>

      <span className="font-semibold tabular-nums text-foreground">
        {hm(session.duration_sec)}
      </span>
    </li>
  )
}

export default function Timer() {
  const {
    user,
    stats,
    leaderboard,
    sessions = [],
    loading,
  } = useStudyData()

  const [userName, setUserName] = useState<string | undefined>()

  const entries = leaderboard?.entries ?? []
  const current = leaderboard?.current

  useEffect(() => {
    if (!user) return

    const currentUserEntry = entries.find(
      (entry) => entry.user_id === user.id
    )

    if (currentUserEntry?.name) {
      setUserName(currentUserEntry.name)
    }
  }, [entries, user?.id])

  async function saveSession(sec: number) {
    const durationSec = Math.floor(Number(sec))

    if (!Number.isFinite(durationSec) || durationSec <= 0) {
      return
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration_sec: durationSec,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save session')
      }

      window.dispatchEvent(new Event('st:synced'))
    } catch (error) {
      console.error('Error saving study session:', error)
    }
  }

  if (!user) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-7xl place-items-center px-4 py-8 text-sm text-muted-foreground">
        {loading
          ? 'Loading your dashboard…'
          : 'Unable to load dashboard.'}
      </main>
    )
  }

  const today = new Date().toDateString()

  const todaySessions = sessions
    .filter(
      (session) =>
        new Date(session.started_at).toDateString() === today
    )
    .sort(
      (a, b) =>
        new Date(b.started_at).getTime() -
        new Date(a.started_at).getTime()
    )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header
          name={userName}
          streak={stats?.streak ?? 0}
          page="home"
        />

        {/* Page heading */}
        <section className="mb-8 mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--s3-faint)]">
              Focus workspace
            </p>

            <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Make time count.
            </h1>

            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              A calm place to focus, track your sessions, and build
              consistency.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <Clock3 className="size-4 shrink-0 text-plum" />

            <div>
              <p className="text-xs text-muted-foreground">
                Today&apos;s focus
              </p>

              <p className="text-lg font-semibold tabular-nums text-foreground">
                {stats ? hm(stats.todaySec) : '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Main dashboard */}
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.85fr)]">
          {/* Focus timer */}
          <Card className="min-h-[520px] border-border bg-card">
            <CardHeader className="gap-1 text-center">
              <CardTitle className="font-sans text-base font-semibold text-card-foreground">
                Focus timer
              </CardTitle>

              <CardDescription className="text-muted-foreground">
                Start a session and give one task your full attention.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col items-center px-5 sm:px-8">
              <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">
                <DashboardTimer onStop={saveSession} />

                <p className="max-w-md text-center text-xs leading-relaxed text-[var(--s3-faint)]">
                  Your completed focus sessions are saved to your study
                  history and analytics.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="grid gap-4">
            {/* Daily progress */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription className="text-muted-foreground">
                    Daily progress
                  </CardDescription>

                  <CardTitle className="mt-1 text-card-foreground">
                    Today&apos;s sessions
                  </CardTitle>
                </div>

                <span className="grid size-9 place-items-center rounded-lg bg-plum-soft text-plum">
                  <Clock3 className="size-4" />
                </span>
              </CardHeader>

              <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {loading ? '—' : todaySessions.length}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      sessions
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {stats ? hm(stats.todaySec) : '—'}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      study time
                    </p>
                  </div>
                </div>

                {loading ? (
                  <p className="py-4 text-sm text-(--s3-faint)">
                    Loading sessions…
                  </p>
                ) : todaySessions.length > 0 ? (
                  <ul>
                    {todaySessions.slice(0, 5).map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Your first completed session will appear here.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription className="text-muted-foreground">
                    This week
                  </CardDescription>

                  <CardTitle className="mt-1 text-card-foreground">
                    Leaderboard
                  </CardTitle>
                </div>

                <span className="grid size-9 place-items-center rounded-lg bg-plum-soft text-plum">
                  <Medal className="size-4" />
                </span>
              </CardHeader>

              <CardContent>
                {entries.length > 0 ? (
                  <ol className="space-y-1">
                    {entries.slice(0, 5).map((entry, index) => {
                      const isCurrentUser =
                        entry.user_id === user.id

                      return (
                        <li
                          key={entry.user_id}
                          className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm ${
                            isCurrentUser
                              ? 'bg-plum-soft text-plum-ink'
                              : 'text-foreground'
                          }`}
                        >
                          <span className="w-5 shrink-0 text-center font-mono text-xs text-[var(--s3-faint)]">
                            {index + 1}
                          </span>

                          <span className="min-w-0 flex-1 truncate font-medium">
                            {entry.name}
                            {isCurrentUser ? ' · you' : ''}
                          </span>

                          <strong className="shrink-0 tabular-nums">
                            {hm(entry.total_sec)}
                          </strong>
                        </li>
                      )
                    })}
                  </ol>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    <Users className="mt-0.5 size-4 shrink-0 text-plum" />

                    <span>
                      Leaderboard data will appear as users complete
                      sessions.
                    </span>
                  </div>
                )}

                {current && (
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground">
                      Your position
                    </span>

                    <strong className="tabular-nums text-foreground">
                      {current.rank
                        ? `#${current.rank}`
                        : 'Not ranked'}{' '}
                      · {hm(current.total_sec)}
                    </strong>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="mt-4 w-full border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() =>
                    window.location.assign('/dashboard')
                  }
                >
                  View full analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
