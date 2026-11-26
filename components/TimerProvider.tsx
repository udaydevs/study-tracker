'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { clock } from '@/lib/format'

type Q = { id: string; started_at: string; duration_sec: number }
const Ctx = createContext<{ running: boolean; elapsed: number; start: () => void; stop: () => void }>(null as any)
export const useTimer = () => useContext(Ctx)
const QK = 'st_queue', AK = 'st_active'

// Offline-first: sessions go to localStorage first, then sync when the network allows.
export async function flush() {
  try {
    const q: Q[] = JSON.parse(localStorage.getItem(QK) || '[]')
    if (!q.length) return
    const r = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
    if (!r.ok) return
    const sent = new Set(q.map((x) => x.id))
    const rest: Q[] = JSON.parse(localStorage.getItem(QK) || '[]')
    localStorage.setItem(QK, JSON.stringify(rest.filter((x) => !sent.has(x.id))))
    window.dispatchEvent(new Event('st:synced'))
  } catch {}
}

export default function TimerProvider({ children }: { children: React.ReactNode }) {
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const a = localStorage.getItem(AK); if (a) setStartedAt(Number(a))
    flush(); window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [])
  useEffect(() => { if (!startedAt) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [startedAt])

  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  const start = () => { const t = Date.now(); localStorage.setItem(AK, String(t)); setNow(t); setStartedAt(t) }
  const stop = () => {
    if (!startedAt) return
    if (elapsed >= 1) {
      const q: Q[] = JSON.parse(localStorage.getItem(QK) || '[]')
      q.push({ id: crypto.randomUUID(), started_at: new Date(startedAt).toISOString(), duration_sec: elapsed })
      localStorage.setItem(QK, JSON.stringify(q))
    }
    localStorage.removeItem(AK); setStartedAt(null); flush()
  }
  return (
    <Ctx.Provider value={{ running: !!startedAt, elapsed, start, stop }}>
      {children}
      <Widget />
    </Ctx.Provider>
  )
}

// Floating mini timer: drag anywhere, minimize to a dot. Hidden on the main screen where the big timer lives.
function Widget() {
  const { running, elapsed, stop } = useTimer()
  const path = usePathname()
  const [min, setMin] = useState(false)
  const [pos, setPos] = useState({ x: 24, y: 88 })
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  if (!running || path === '/' || path === '/login') return null
  const handle = {
    onPointerDown: (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y } },
    onPointerMove: (e: React.PointerEvent) => { if (drag.current) setPos({ x: Math.max(0, e.clientX - drag.current.dx), y: Math.max(0, e.clientY - drag.current.dy) }) },
    onPointerUp: () => { drag.current = null },
  }
  return (
    <div className={`widget ${min ? 'min' : ''}`} style={{ left: pos.x, top: pos.y }}>
      <div className="grip mono" {...handle}>{clock(elapsed)}</div>
      {!min && <button onClick={stop}>Stop</button>}
      <button aria-label={min ? 'Expand timer' : 'Minimize timer'} onClick={() => setMin(!min)}>{min ? '+' : '–'}</button>
    </div>
  )
}
