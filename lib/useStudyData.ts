'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type {
  LeaderboardData,
  StudyData,
  StudyStats,
  StudyUser,
} from '@/lib/study-types'

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
    const get = async <T,>(url: string): Promise<T> => {
      const response = await fetch(url, {
        cache: 'no-store',
      })

      if (response.status === 401) {
        router.replace('/login')
        throw AUTH_ERROR
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${url}`)
      }

      return response.json()
    }

    try {
      const [user, stats] = await Promise.all([
        get<StudyUser>('/api/user'),

        get<StudyStats>(
          `/api/stats?tz=${new Date().getTimezoneOffset()}`
        ),
      ])

      let leaderboard = EMPTY_LEADERBOARD

      try {
        // Fresh leaderboard data from the API
        leaderboard = await get<LeaderboardData>(
          '/api/topUser'
        )
      } catch (error) {
        console.error('Leaderboard fetch failed:', error)
      }

      const next: StudyData = {
        user,
        stats,
        top: leaderboard.entries,
        leaderboard,
      }

      setD(next)

      // Store data for offline fallback only.
      localStorage.setItem('st_cache', JSON.stringify(next))
    } catch (error) {
      if (error === AUTH_ERROR) return

      console.error('Study data fetch failed:', error)

      // Use cached data only if the network request fails.
      try {
        const cached = localStorage.getItem('st_cache')

        if (cached) {
          setD(JSON.parse(cached) as StudyData)
        }
      } catch {
        // Ignore malformed or unavailable cache.
      }
    }
  }, [router])

  useEffect(() => {
    load()

    window.addEventListener('st:synced', load)

    return () => {
      window.removeEventListener('st:synced', load)
    }
  }, [load])

  return {
    ...d,
    reload: load,
  }
}