
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Clock3, Medal, Users } from 'lucide-react'
import Header from '@/components/Header'
import DashboardTimer from '@/components/dashboard-timer'
import { useStudyData } from '@/lib/useStudyData'
import { hm } from '@/lib/format'
import type { StudySession } from '@/lib/study-types'

type SessionRowProps = {
  session: StudySession
}

function SessionRow({ session }: SessionRowProps) {
  return (
    <li className="session-row">
      <span className="session-time">
        {new Date(session.started_at).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </span>

      <span className="session-duration">
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
  } = useStudyData()

  const [sessions, setSessions] = useState<StudySession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data: StudySession[] = await response.json()

      setSessions(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()

    window.addEventListener('st:synced', loadSessions)

    return () => {
      window.removeEventListener('st:synced', loadSessions)
    }
  }, [loadSessions])

  // POST: Save one completed session
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

      console.log('Study session saved:', data)

      // Trigger GET again after successful POST
      window.dispatchEvent(new Event('st:synced'))
    } catch (error) {
      console.error('Error saving study session:', error)
    }
  }

  if (!user) {
    return (
      <main className="dashboard-shell">
        <div className="dashboard-loading" role="status">
          Loading your dashboard…
        </div>
      </main>
    )
  }

  // Filter sessions to today's date
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

  const entries = leaderboard?.entries ?? []
  const current = leaderboard?.current

  return (
    <main className="dashboard-shell">
      <Header
        name={user?.name}
        streak={stats?.streak ?? 0}
        page="dash"
      />
      <div className="dashboard-grid">
        <section className="dashboard-intro">
          <div className="flex w-full flex-col items-center justify-center gap-8 bg-background px-6 text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] text-ns-muted">
              LAUNCH WINDOW CLOSES IN
            </p>

            <DashboardTimer onStop={saveSession} />

            <p className="font-mono text-[10px] tracking-[0.15em] text-ns-muted">
              retarget to watch every digit sublimate and condense at once
            </p>
          </div>
        </section>

        <aside className="dashboard-side">
          {/* Today's sessions */}
          <section
            className="dashboard-card side-card"
            aria-labelledby="sessions-title"
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Daily progress</p>
                <h2 id="sessions-title">Today's sessions</h2>
              </div>

              <span className="panel-icon">
                <Clock3 size={18} />
              </span>
            </div>

            <div className="today-metrics">
              <div>
                <strong>
                  {sessionsLoading ? '—' : todaySessions.length}
                </strong>
                <span>sessions</span>
              </div>

              <div>
                <strong>
                  {stats ? hm(stats.todaySec) : '—'}
                </strong>
                <span>study time</span>
              </div>
            </div>

            {sessionsLoading ? (
              <div className="panel-empty">
                Loading sessions…
              </div>
            ) : todaySessions.length ? (
              <ul className="session-list">
                {todaySessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                  />
                ))}
              </ul>
            ) : (
              <div className="panel-empty">
                No completed sessions yet. Your first one will show up here.
              </div>
            )}
          </section>

          {/* Leaderboard */}
          <section
            className="dashboard-card side-card"
            aria-labelledby="leaderboard-title"
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">This week</p>
                <h2 id="leaderboard-title">Leaderboard</h2>
              </div>

              <span className="panel-icon">
                <Medal size={18} />
              </span>
            </div>

            {entries.length ? (
              <ol className="leaderboard-list">
                {entries.map((entry, index) => (
                  <li
                    key={entry.user_id}
                    className={
                      entry.user_id === user.id
                        ? 'leaderboard-row leaderboard-row-current'
                        : 'leaderboard-row'
                    }
                  >
                    <span className="leaderboard-rank">
                      {index + 1}
                    </span>

                    <span className="leaderboard-name">
                      {entry.name}
                      {entry.user_id === user.id ? ' · you' : ''}
                    </span>

                    <strong>
                      {hm(entry.total_sec)}
                    </strong>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="panel-empty">
                <Users size={18} />
                Leaderboard data will appear once users have completed sessions.
              </div>
            )}

            {current && (
              <div className="your-rank">
                <span>Your position</span>

                <strong>
                  {current.rank ? `#${current.rank}` : 'Not ranked yet'}
                </strong>

                <small>
                  {hm(current.total_sec)} this week
                </small>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}
