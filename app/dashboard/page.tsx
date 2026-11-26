'use client'
import Header from '@/components/Header'
import { useStudyData } from '@/lib/useStudyData'
import { hm } from '@/lib/format'

export default function Dashboard() {
  const { user, stats } = useStudyData()
  const max = Math.max(1, ...(stats?.week.map((d: any) => d.sec) ?? [1]))
  return (
    <main className="wrap">
      <Header name={user?.name} streak={stats?.streak} page="dash" />
      <div className="grid-3">
        <div className="card"><p className="muted">Today</p><div className="big">{stats ? hm(stats.todaySec) : '–'}</div></div>
        <div className="card"><p className="muted">Last 7 days</p><div className="big">{stats ? hm(stats.weekSec) : '–'}</div></div>
        <div className="card"><p className="muted">All time · {stats?.totalSessions ?? 0} sessions</p><div className="big">{stats ? hm(stats.totalSec) : '–'}</div></div>
      </div>
      <section className="card">
        <h2>Daily study time</h2>
        <div className="bars">
          {stats?.week.map((d: any) => (
            <div key={d.date} className="col">
              <span className="mono">{d.sec ? hm(d.sec) : ''}</span>
              <div className="bar-fill" style={{ height: `${(d.sec / max) * 100}%` }} />
              <span className="mono">{new Date(d.date).toLocaleDateString([], { weekday: 'short', timeZone: 'UTC' })}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
