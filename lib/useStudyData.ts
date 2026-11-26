'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LeaderboardData, StudyData, StudyStats, StudyUser } from '@/lib/study-types'

const AUTH_ERROR = 'auth'

const EMPTY_LEADERBOARD: LeaderboardData = {
  entries: [],
  current: null,
  available: false,
}

export function useStudyData() {
  const router = useRouter()
  const [d, setD] = useState<StudyData>({})
  const load = useCallback(async () => {
    const get = async <T,>(u: string): Promise<T> => {
      const r = await fetch(u)
      if (r.status === 401) { router.replace('/login'); throw AUTH_ERROR }
      if (!r.ok) throw new Error('Request failed')
      return r.json()
    }
    try {
      const [user, stats] = await Promise.all([
        get<StudyUser>('/api/user'),
        get<StudyStats>(`/api/stats?tz=${new Date().getTimezoneOffset()}`),
      ])
      let leaderboard = EMPTY_LEADERBOARD
      try {
        leaderboard = await get<LeaderboardData>('/api/leaderboard')
      } catch {
        // Leaderboard access is optional. The dashboard shows an honest empty state.
      }
      const next: StudyData = { user, stats, top: leaderboard.entries, leaderboard }
      setD(next)
      localStorage.setItem('st_cache', JSON.stringify(next))
    } catch (e) {
      if (e === AUTH_ERROR) return
      try {
        const c = localStorage.getItem('st_cache') // offline: show last known data
        if (c) setD(JSON.parse(c) as StudyData)
      } catch {
        // Ignore malformed or unavailable offline cache.
      }
    }
  }, [router])
  useEffect(() => {
    load()
    window.addEventListener('st:synced', load)
    return () => window.removeEventListener('st:synced', load)
  }, [load])
  return d
}