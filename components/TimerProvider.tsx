'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export const FOCUS_SECONDS = 25 * 60
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'
type Q = { id: string; started_at: string; duration_sec: number }

const QK = 'st_queue' // sessions waiting to sync
const TK = 'st_timer' // running timer, so it survives navigation and refresh
const MSG: Record<TimerStatus, string> = {
  idle: 'Ready when you are.',
  running: 'Stay focused. You can pause whenever you need to.',
  paused: 'Paused. Resume when you are ready.',
  completed: 'Focus complete. Mark the session as completed to save it.',
}

type Ctx = {
  status: TimerStatus; remaining: number; message: string; saving: boolean; saved: boolean
  start: () => void; pause: () => void; reset: () => void; complete: () => Promise<void>
  setCardVisible: (v: boolean) => void
}
const TimerCtx = createContext<Ctx>(null as any)
export const useTimer = () => useContext(TimerCtx)
export const formatRemaining = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// Offline-first sync: sessions are queued in localStorage and uploaded when possible.
export async function flush(): Promise<'ok' | 'empty' | 'auth' | 'fail'> {
  try {
    const q: Q[] = JSON.parse(localStorage.getItem(QK) || '[]')
    if (!q.length) return 'empty'
    const r = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
    if (r.status === 401) return 'auth'
    if (!r.ok) return 'fail'
    const sent = new Set(q.map((x) => x.id))
    const rest: Q[] = JSON.parse(localStorage.getItem(QK) || '[]')
    localStorage.setItem(QK, JSON.stringify(rest.filter((x) => !sent.has(x.id))))
    window.dispatchEvent(new Event('st:synced'))
    return 'ok'
  } catch { return 'fail' }
}

export default function TimerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [remaining, setRemaining] = useState(FOCUS_SECONDS)
  const [message, setMessage] = useState(MSG.idle)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cardVisible, setCardVisible] = useState(false)
  const endAt = useRef<number | null>(null)
  const startedAt = useRef<number | null>(null)

  const persist = (s: TimerStatus, rem: number, isSaved = false) =>
    localStorage.setItem(TK, JSON.stringify({ status: s, remaining: rem, endAt: endAt.current, startedAt: startedAt.current, saved: isSaved }))

  // restore a timer that was running before a navigation or refresh
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(TK) || 'null')
      if (s) {
        startedAt.current = s.startedAt; endAt.current = s.endAt
        if (s.status === 'running') {
          const rem = Math.max(0, Math.ceil((s.endAt - Date.now()) / 1000))
          setRemaining(rem)
          setStatus(rem === 0 ? 'completed' : 'running')
          setMessage(rem === 0 ? MSG.completed : MSG.running)
        } else {
          setStatus(s.status); setRemaining(s.remaining); setSaved(!!s.saved)
          setMessage(s.saved ? 'Session saved. Nice work.' : MSG[s.status as TimerStatus])
        }
      }
    } catch {}
    flush()
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [])

  useEffect(() => { flush() }, [path]) // e.g. right after logging in

  useEffect(() => {
    if (status !== 'running') return
    let id: number | undefined
    const tick = () => {
      if (!endAt.current) return
      const next = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setRemaining(next)
      if (next === 0) { setStatus('completed'); setMessage(MSG.completed); persist('completed', 0); return }
      id = window.setTimeout(tick, 1000)
    }
    id = window.setTimeout(tick, 1000)
    return () => { if (id !== undefined) window.clearTimeout(id) }
  }, [status])

  const start = () => {
    if (remaining <= 0 || status === 'completed') return
    const now = Date.now()
    if (!startedAt.current) startedAt.current = now
    endAt.current = now + remaining * 1000
    setStatus('running'); setMessage(MSG.running); persist('running', remaining)
  }
  const pause = () => {
    if (status !== 'running' || !endAt.current) return
    const rem = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
    setRemaining(rem); setStatus('paused'); setMessage(MSG.paused); persist('paused', rem)
  }
  const reset = () => {
    endAt.current = null; startedAt.current = null
    setRemaining(FOCUS_SECONDS); setStatus('idle'); setMessage(MSG.idle); setSaved(false)
    localStorage.removeItem(TK)
  }
  const complete = async () => {
    if (status !== 'completed' || !startedAt.current || saving || saved) return
    setSaving(true); setMessage('Saving your completed session…')
    const q: Q[] = JSON.parse(localStorage.getItem(QK) || '[]')
    q.push({ id: crypto.randomUUID(), started_at: new Date(startedAt.current).toISOString(), duration_sec: FOCUS_SECONDS })
    localStorage.setItem(QK, JSON.stringify(q)) // stored locally first, so it is never lost
    const r = await flush()
    setSaving(false); setSaved(true); persist('completed', 0, true)
    setMessage(r === 'ok' ? 'Session saved. Nice work.'
      : r === 'auth' ? 'Saved on this device. Log in to sync it.'
      : 'Saved on this device. It will sync when you are back online.')
    if (r === 'auth') router.replace('/login')
  }

  return (
    <TimerCtx.Provider value={{ status, remaining, message, saving, saved, start, pause, reset, complete, setCardVisible }}>
      {children}
      {status !== 'idle' && !cardVisible && path !== '/login' && <Widget />}
    </TimerCtx.Provider>
  )
}

// Floating mini timer: drag it anywhere, minimize it. Hidden while the full timer card is on screen.
function Widget() {
  const { status, remaining, saving, saved, start, pause, reset, complete } = useTimer()
  const [min, setMin] = useState(false)
  const [pos, setPos] = useState({ x: 24, y: 88 })
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const handle = {
    onPointerDown: (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y } },
    onPointerMove: (e: React.PointerEvent) => { if (drag.current) setPos({ x: Math.max(0, e.clientX - drag.current.dx), y: Math.max(0, e.clientY - drag.current.dy) }) },
    onPointerUp: () => { drag.current = null },
  }
  return (
    <div className={`widget ${min ? 'min' : ''}`} style={{ left: pos.x, top: pos.y }}>
      <div className="grip mono" {...handle}>{formatRemaining(remaining)}</div>
      {!min && (
        status === 'running' ? <button onClick={pause}>Pause</button>
        : status === 'paused' ? <button onClick={start}>Resume</button>
        : saved ? <button onClick={reset}>Done</button>
        : <button onClick={complete} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      )}
      <button aria-label={min ? 'Expand timer' : 'Minimize timer'} onClick={() => setMin(!min)}>{min ? '+' : '–'}</button>
    </div>
  )
}
