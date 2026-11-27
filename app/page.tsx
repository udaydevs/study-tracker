'use client'

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
    sessions = [],
    loading,
  } = useStudyData()

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
        body: JSON.stringify({ duration_sec: durationSec }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save session')
      }

      // The shared hook refreshes the complete dashboard from one endpoint.
      window.dispatchEvent(new Event('st:synced'))
    } catch (error) {
      console.error('Error saving study session:', error)
    }
  }

  if (!user) {
    return (
      <main className="dashboard-shell">
        <div className="dashboard-loading" role="status">
          {loading ? 'Loading your dashboard…' : 'Unable to load dashboard.'}
        </div>
      </main>
    )
  }

  const today = new Date().toDateString()

  const todaySessions = sessions
    .filter((session) => new Date(session.started_at).toDateString() === today)
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
        name={user.name}
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
                <strong>{loading ? '—' : todaySessions.length}</strong>
                <span>sessions</span>
              </div>

              <div>
                <strong>{stats ? hm(stats.todaySec) : '—'}</strong>
                <span>study time</span>
              </div>
            </div>

            {loading ? (
              <div className="panel-empty">Loading sessions…</div>
            ) : todaySessions.length ? (
              <ul className="session-list">
                {todaySessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </ul>
            ) : (
              <div className="panel-empty">
                No completed sessions yet. Your first one will show up here.
              </div>
            )}
          </section>

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
                    <span className="leaderboard-rank">{index + 1}</span>

                    <span className="leaderboard-name">
                      {entry.name}
                      {entry.user_id === user.id ? ' · you' : ''}
                    </span>

                    <strong>{hm(entry.total_sec)}</strong>
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

                <small>{hm(current.total_sec)} this week</small>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}
