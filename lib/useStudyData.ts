'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useStudyData() {
  const router = useRouter()
  const [d, setD] = useState<any>({})
  const load = useCallback(async () => {
    const get = async (u: string) => {
      const r = await fetch(u)
      if (r.status === 401) { router.replace('/login'); throw 'auth' }
      if (!r.ok) throw 'fail'
      return r.json()
    }
    try {
      const [user, stats, top] = await Promise.all([
        get('/api/user'), get(`/api/stats?tz=${new Date().getTimezoneOffset()}`), get('/api/topUser'),
      ])
      setD({ user, stats, top })
      localStorage.setItem('st_cache', JSON.stringify({ user, stats, top }))
    } catch (e) {
      if (e === 'auth') return
      const c = localStorage.getItem('st_cache') // offline: show last known data
      if (c) setD(JSON.parse(c))
    }
  }, [router])
  useEffect(() => {
    load()
    window.addEventListener('st:synced', load)
    return () => window.removeEventListener('st:synced', load)
  }, [load])
  return d as { user?: any; stats?: any; top?: any[] }
}
