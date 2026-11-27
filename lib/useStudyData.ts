'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { StudyData } from '@/lib/study-types'

const EMPTY_DATA: StudyData = {
  top: [],
  leaderboard: {
    entries: [],
    current: null,
    available: false,
  },
  sessions: [],
}

export function useStudyData() {
  const router = useRouter()
  const [d, setD] = useState<StudyData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard?tz=${new Date().getTimezoneOffset()}`,
        { cache: 'no-store' }
      )

      if (response.status === 401) {
        router.replace('/login')
        return
      }

      if (!response.ok) {
        throw new Error(`Dashboard request failed: ${response.status}`)
      }

      const next = (await response.json()) as StudyData
      setD(next)

      try {
        localStorage.setItem('st_cache', JSON.stringify(next))
      } catch {
        // Storage may be unavailable; dashboard still works online.
      }
    } catch (error) {
      console.error('Dashboard data fetch failed:', error)

      // Show the last successful dashboard snapshot if offline or API fails.
      try {
        const cached = localStorage.getItem('st_cache')
        if (cached) {
          setD(JSON.parse(cached) as StudyData)
        }
      } catch {
        // Ignore unavailable storage or invalid cached JSON.
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Render cached data immediately while refreshing it in the background.
    try {
      const cached = localStorage.getItem('st_cache')
      if (cached) setD(JSON.parse(cached) as StudyData)
    } catch {
      // Ignore cache errors.
    }

    void load()

    const handleSynced = () => {
      void load()
    }

    window.addEventListener('st:synced', handleSynced)
    return () => window.removeEventListener('st:synced', handleSynced)
  }, [load])

  return {
    ...d,
    loading,
    reload: load,
  }
}
