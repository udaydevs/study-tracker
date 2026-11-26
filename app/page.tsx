"use client"
import { useState } from "react";
import { Clock3, Medal, Users } from 'lucide-react'
import Header from '@/components/Header'
import DashboardTimer from '@/components/dashboard-timer'
import { useStudyData } from '@/lib/useStudyData'
import { hm } from '@/lib/format'
import type { StudySession } from '@/lib/study-types'
import { Button } from "@/components/ui/button"
function SessionRow({ session }: { session: StudySession }) {
  return (
    <li className="session-row">
      <span className="session-time">
        {new Date(session.started_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </span>
      <span className="session-duration">{hm(session.duration_sec)}</span>
    </li>
  )
}

  export default function Timer() {
      const [target, setTarget] = useState(
    () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  );

  const retarget = (seconds: number) => {
    setTarget(new Date(Date.now() + seconds * 1000));
  };

    const { user, stats, leaderboard } = useStudyData()

    if (!user) {
      return (
        <main className="dashboard-shell">
          <div className="dashboard-loading" role="status">Loading your dashboard…</div>
        </main>
      )
    }

    const sessions = stats?.todaySessions ?? []
    const entries = leaderboard?.entries ?? []
    const current = leaderboard?.current

    return (
      <main className="dashboard-shell">
        <Header name={user.name} streak={stats?.streak ?? 0} page="dash" />

        <div className="dashboard-grid">
          <section className="dashboard-intro">
          <div className="flex  w-full flex-col items-center justify-center gap-8 bg-background px-6 text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] text-ns-muted">
              LAUNCH WINDOW CLOSES IN
            </p>
            <DashboardTimer targetDate={target} />
            <div className="flex items-center gap-3">
              <Button
                onClick={() => retarget(24 * 3600)}
              >
                T-24H
              </Button>
              <button
                onClick={() => retarget(3600)}
                className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-foreground transition-colors hover:bg-accent"
              >
                T-1H
              </button>
              <button
                onClick={() => retarget(90)}
                className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-foreground transition-colors hover:bg-accent"
              >
                T-90S
              </button>
            </div>
            <p className="font-mono text-[10px] tracking-[0.15em] text-ns-muted">
              retarget to watch every digit sublimate and condense at once
            </p>
          </div>
        </section>

          <aside className="dashboard-side">
            <section className="dashboard-card side-card" aria-labelledby="sessions-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Daily progress</p>
                  <h2 id="sessions-title">Today&apos;s sessions</h2>
                </div>
                <span className="panel-icon"><Clock3 size={18} /></span>
              </div>
              <div className="today-metrics">
                <div><strong>{sessions.length}</strong><span>sessions</span></div>
                <div><strong>{stats ? hm(stats.todaySec) : '—'}</strong><span>study time</span></div>
              </div>
              {sessions.length ? (
                <ul className="session-list">
                  {sessions.map((session) => <SessionRow key={session.id} session={session} />)}
                </ul>
              ) : (
                <div className="panel-empty">No completed sessions yet. Your first one will show up here.</div>
              )}
            </section>

            <section className="dashboard-card side-card" aria-labelledby="leaderboard-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">This week</p>
                  <h2 id="leaderboard-title">Leaderboard</h2>
                </div>
                <span className="panel-icon"><Medal size={18} /></span>
              </div>
              {entries.length ? (
                <ol className="leaderboard-list">
                  {entries.map((entry, index) => (
                    <li key={entry.user_id} className={entry.user_id === user.id ? 'leaderboard-row leaderboard-row-current' : 'leaderboard-row'}>
                      <span className="leaderboard-rank">{index + 1}</span>
                      <span className="leaderboard-name">{entry.name}{entry.user_id === user.id ? ' · you' : ''}</span>
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
                  <strong>{current.rank ? `#${current.rank}` : 'Not ranked yet'}</strong>
                  <small>{hm(current.total_sec)} this week</small>
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    )
  }