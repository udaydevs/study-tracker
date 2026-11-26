"use client"
import { Clock3, Medal, Users } from 'lucide-react'
import Header from '@/components/Header'
import DashboardTimer from '@/components/dashboard-timer'
import { useStudyData } from '@/lib/useStudyData'
import { hm } from '@/lib/format'
import type { StudySession } from '@/lib/study-types'

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

export default function Dashboard() {
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
    <div></div>
  )
}