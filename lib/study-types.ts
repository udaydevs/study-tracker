export type StudySession = {
  id: string
  started_at: string
  duration_sec: number
}

export type StudyUser = {
  id: string
  email?: string
  name?: string
}

export type StudyStats = {
  todaySec: number
  todaySessions: StudySession[]
  week: Array<{ date: string; sec: number }>
  weekSec: number
  streak: number
  totalSec: number
  totalSessions: number
}

export type LeaderboardEntry = {
  user_id: string
  name: string
  total_sec: number
}

export type CurrentLeaderboardEntry = LeaderboardEntry & {
  rank: number | null
}

export type LeaderboardData = {
  entries: LeaderboardEntry[]
  current: CurrentLeaderboardEntry | null
  available: boolean
}

export type StudyData = {
  user?: StudyUser
  stats?: StudyStats
  top?: LeaderboardEntry[]
  leaderboard?: LeaderboardData
}