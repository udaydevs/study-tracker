'use client'
import Header from '@/components/Header'
import { useTimer } from '@/components/TimerProvider'
import { useStudyData } from '@/lib/useStudyData'
import { clock, hm } from '@/lib/format'

export default function Home() {
  const { user, stats, top } = useStudyData()
  const { running, elapsed, start, stop } = useTimer()
  return (
    <main className="wrap">
      <Header name={user?.name} streak={stats?.streak} page="home" />
      <div className="grid-main">
        <section className="card night timer">
          <div className="clock mono" aria-live="off">{clock(elapsed)}</div>
          <button className="go" onClick={running ? stop : start}>{running ? 'Stop and save' : 'Start studying'}</button>
        </section>
        <aside className="side">
          <section className="card">
            <h2>Today: {stats ? hm(stats.todaySec) : '–'} in {stats?.todaySessions.length ?? 0} sessions</h2>
            {stats?.todaySessions.length ? (
              <ul className="list">
                {stats.todaySessions.map((s: any) => (
                  <li key={s.id}><span className="mono">{new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><b>{hm(s.duration_sec)}</b></li>
                ))}
              </ul>
            ) : <p className="muted">No sessions yet. Start the timer to log your first one.</p>}
          </section>
          <section className="card">
            <h2>This week's top students</h2>
            <ol className="list">
              {top?.map((u: any, i: number) => (
                <li key={u.user_id} className={u.user_id === user?.id ? 'me' : ''}><span>{i + 1}. {u.name}</span><b>{hm(u.total_sec)}</b></li>
              ))}
            </ol>
            {!top?.length && <p className="muted">Nobody has studied this week yet.</p>}
          </section>
        </aside>
      </div>
    </main>
  )
}
