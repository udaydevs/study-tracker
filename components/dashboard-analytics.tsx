'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays,
  CalendarRange, Clock3, Flame, Search, Sparkles, TimerReset,
  TrendingUp, Trophy, Zap,
  type LucideIcon,
} from 'lucide-react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ChartBar, ChartContainer, ChartGrid } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hm } from '@/lib/format'
import { useStudyData } from '@/lib/useStudyData'
import type { StudySession } from '@/lib/study-types'

type RangeKey = '7d' | '30d' | '90d' | 'all'
type Point = { label: string; value: number; detail: string }

const ranges: { value: RangeKey; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
]
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const dayStart = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const dateLabel = (d: Date, options: Intl.DateTimeFormatOptions = {}) => d.toLocaleDateString(undefined, options)
const duration = (s: StudySession) => Math.max(0, Number(s.duration_sec) || 0)

function Metric({
  title, value, description, icon: Icon, change,
}: {
  title: string; value: string; description: string; icon: LucideIcon; change?: number
}) {
  return (
    <Card className="border-[#ece9f2] shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="text-[11px] font-bold uppercase tracking-[.12em]">{title}</CardDescription>
          <CardTitle className="mt-2 text-[1.8rem] font-semibold tracking-[-.055em]">{value}</CardTitle>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-[#efeafd] text-[#6b3fd8]"><Icon size={18} /></span>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 pt-1">
        <p className="text-xs text-[#777187]">{description}</p>
        {change !== undefined && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(Math.round(change))}%
          </span>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityChart({ points }: { points: Point[] }) {
  const max = Math.max(3600, ...points.map((point) => point.value))
  return (
    <ChartContainer
      config={{ focus: { label: "Focus time", color: "var(--primary)" } }}
      className="h-[225px]"
    >
      <div className="relative flex h-full gap-1.5">
        <ChartGrid className="bottom-7" rows={4} />
        {points.map((point, index) => (
          <ChartBar
            key={point.detail + index}
            value={point.value}
            max={max}
            label={point.label}
            detail={point.detail}
          />
        ))}
      </div>
    </ChartContainer>
  )
}

function Bars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.value))
  return <div className="space-y-3">{items.map((item) => (
    <div key={item.label} className="space-y-1.5">
      <div className="flex justify-between gap-3 text-xs"><span className="text-[#777187]">{item.label}</span><strong>{hm(item.value)}</strong></div>
      <Progress value={item.value / max * 100} className="h-2" />
    </div>
  ))}</div>
}

export default function DashboardAnalytics() {
  const { user, leaderboard, sessions = [], loading, reload } = useStudyData()
  const [range, setRange] = useState<RangeKey>('30d')
  const [view, setView] = useState<'overview' | 'sessions'>('overview')
  const [search, setSearch] = useState('')
  const [goalMinutes, setGoalMinutes] = useState(60)
  const [goalLoaded, setGoalLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('st_daily_goal_minutes')
      if (saved) setGoalMinutes(Math.min(360, Math.max(15, Number(saved) || 60)))
    } catch {}
    setGoalLoaded(true)
  }, [])
  useEffect(() => {
    if (!goalLoaded) return
    try { localStorage.setItem('st_daily_goal_minutes', String(goalMinutes)) } catch {}
  }, [goalMinutes, goalLoaded])

  const allSessions = useMemo(() => sessions
    .map((s) => ({ ...s, duration_sec: duration(s) }))
    .filter((s) => s.duration_sec > 0 && Number.isFinite(new Date(s.started_at).getTime())), [sessions])

  const today = new Date()
  const todayStart = dayStart(today)
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : null
  const start = days ? new Date(todayStart.getTime() - (days - 1) * 86400000) : null

  const selected = useMemo(() => allSessions.filter((s) => !start || new Date(s.started_at).getTime() >= start.getTime()), [allSessions, start?.getTime()])
  const previous = useMemo(() => {
    if (!start || !days) return []
    const before = new Date(start.getTime() - days * 86400000)
    return allSessions.filter((s) => { const t = new Date(s.started_at).getTime(); return t >= before.getTime() && t < start.getTime() })
  }, [allSessions, start?.getTime(), days])

  const total = selected.reduce((sum, s) => sum + duration(s), 0)
  const previousTotal = previous.reduce((sum, s) => sum + duration(s), 0)
  const count = selected.length
  const avg = count ? total / count : 0
  const activeSet = new Set(selected.map((s) => dateKey(new Date(s.started_at))))
  const activeDays = activeSet.size
  const dailyAvg = activeDays ? total / activeDays : 0
  const change = previousTotal ? (total - previousTotal) / previousTotal * 100 : total > 0 ? 100 : 0

  const todayKey = dateKey(today)
  const todaySessions = allSessions.filter((s) => dateKey(new Date(s.started_at)) === todayKey)
  const todayTotal = todaySessions.reduce((sum, s) => sum + duration(s), 0)
  const goalSec = goalMinutes * 60
  const goalPercent = goalSec ? todayTotal / goalSec * 100 : 0

  const streak = useMemo(() => {
    const active = new Set(allSessions.map((s) => dateKey(new Date(s.started_at))))
    const cursor = dayStart(new Date())
    if (!active.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
    let n = 0
    while (active.has(dateKey(cursor))) { n++; cursor.setDate(cursor.getDate() - 1) }
    return n
  }, [allSessions])

  const chartPoints = useMemo<Point[]>(() => {
    if (range === 'all') {
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const value = allSessions.reduce((sum, s) => {
          const x = new Date(s.started_at), k = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`
          return sum + (k === key ? duration(s) : 0)
        }, 0)
        return { label: dateLabel(d, { month: 'short' }), value, detail: dateLabel(d, { month: 'long', year: 'numeric' }) }
      })
    }
    if (range === '90d') {
      return Array.from({ length: 13 }, (_, i) => {
        const end = new Date(todayStart.getTime() - (12 - i) * 7 * 86400000)
        const from = new Date(end.getTime() - 6 * 86400000)
        const value = allSessions.reduce((sum, s) => { const t = new Date(s.started_at).getTime(); return sum + (t >= from.getTime() && t < end.getTime() + 86400000 ? duration(s) : 0) }, 0)
        return { label: dateLabel(from, { day: 'numeric', month: 'short' }), value, detail: `Week of ${dateLabel(from, { day: 'numeric', month: 'short' })}` }
      })
    }
    const n = range === '7d' ? 7 : 30
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(todayStart.getTime() - (n - 1 - i) * 86400000), key = dateKey(d)
      const value = allSessions.reduce((sum, s) => sum + (dateKey(new Date(s.started_at)) === key ? duration(s) : 0), 0)
      return { label: range === '7d' ? dateLabel(d, { weekday: 'short' }) : dateLabel(d, { day: 'numeric' }), value, detail: dateLabel(d, { weekday: 'long', day: 'numeric', month: 'long' }) }
    })
  }, [allSessions, range, todayStart.getTime()])

  const weekdayData = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], totals = Array(7).fill(0) as number[]
    selected.forEach((s) => { const d = new Date(s.started_at).getDay(); totals[(d + 6) % 7] += duration(s) })
    return labels.map((label, i) => ({ label, value: totals[i] }))
  }, [selected])

  const hourData = useMemo(() => {
    const blocks = [
      { label: 'Late night · 12–4', start: 0, end: 4, value: 0 },
      { label: 'Early morning · 4–8', start: 4, end: 8, value: 0 },
      { label: 'Morning · 8–12', start: 8, end: 12, value: 0 },
      { label: 'Afternoon · 12–4', start: 12, end: 16, value: 0 },
      { label: 'Evening · 4–8', start: 16, end: 20, value: 0 },
      { label: 'Night · 8–12', start: 20, end: 24, value: 0 },
    ]
    selected.forEach((s) => { const h = new Date(s.started_at).getHours(); const b = blocks.find((x) => h >= x.start && h < x.end); if (b) b.value += duration(s) })
    return blocks
  }, [selected])

  const heatmap = useMemo(() => {
    const first = dayStart(new Date()); first.setDate(first.getDate() - 83); first.setDate(first.getDate() - ((first.getDay() + 6) % 7))
    const byDay = new Map<string, number>()
    allSessions.forEach((s) => { const k = dateKey(new Date(s.started_at)); byDay.set(k, (byDay.get(k) ?? 0) + duration(s)) })
    return Array.from({ length: 84 }, (_, i) => { const d = new Date(first.getTime() + i * 86400000); return { date: d, value: byDay.get(dateKey(d)) ?? 0 } })
  }, [allSessions])

  const bestDay = useMemo(() => {
    const totals = new Map<string, number>()
    selected.forEach((s) => { const k = dateKey(new Date(s.started_at)); totals.set(k, (totals.get(k) ?? 0) + duration(s)) })
    return [...totals.entries()].sort((a, b) => b[1] - a[1])[0]
  }, [selected])
  const longest = allSessions.reduce<StudySession | null>((best, s) => !best || duration(s) > duration(best) ? s : best, null)

  const sessionRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...selected].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .filter((s) => !q || dateLabel(new Date(s.started_at), { dateStyle: 'full' }).toLowerCase().includes(q))
      .slice(0, 25)
  }, [selected, search])

  if (!user && loading) return <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><div className="grid min-h-[70vh] place-items-center text-sm text-[#777187]" role="status">Loading your analytics…</div></main>
  if (!user) return <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><Card className="mx-auto mt-16 max-w-lg"><CardHeader><CardTitle>Analytics unavailable</CardTitle><CardDescription>We couldn't load your study data. Try refreshing.</CardDescription></CardHeader><CardContent><Button onClick={() => void reload()}>Try again</Button></CardContent></Card></main>

  const leaderboardEntries = leaderboard?.entries ?? []
  const myRank = leaderboard?.current

  return (
    <main className="min-h-screen bg-[#f8f7fb]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header name={user.name} streak={streak} page="dash" />
        <section className="mb-7 mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#8c849f]"><Sparkles size={14} className="text-[#6b3fd8]" /> Your learning dashboard</div>
            <h1 className="text-3xl font-semibold tracking-[-.06em] sm:text-4xl">Study analytics<span className="text-[#6b3fd8]">.</span></h1>
            <p className="mt-2 max-w-xl text-sm text-[#777187]">Understand your consistency, focus patterns, and progress over time.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void reload()} disabled={loading}><Activity size={15} />{loading ? 'Refreshing…' : 'Refresh'}</Button>
            <Button size="sm" onClick={() => window.location.assign('/')}><Zap size={15} />Start focus session</Button>
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(['overview', 'sessions'] as const).map((tab) => (
              <Button key={tab} size="sm" variant={view === tab ? 'default' : 'outline'} onClick={() => setView(tab)}>
                {tab === 'overview' ? 'Overview' : 'Session history'}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ranges.map((r) => (
              <Button key={r.value} size="sm" variant={range === r.value ? 'secondary' : 'outline'} onClick={() => setRange(r.value)}>
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {view === 'overview' ? <>
          <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric title="Focus time" value={hm(total)} description={range === 'all' ? 'All recorded sessions' : `Selected ${range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}`} icon={Clock3} change={range === 'all' ? undefined : change} />
            <Metric title="Sessions" value={count.toLocaleString()} description={`${activeDays} active ${activeDays === 1 ? 'day' : 'days'} in this period`} icon={TimerReset} />
            <Metric title="Average session" value={hm(avg)} description="Per completed session" icon={Activity} />
            <Metric title="Daily average" value={hm(dailyAvg)} description="On days you studied" icon={TrendingUp} />
          </section>

          <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.85fr)]">
            <Card className="border-[#ece9f2] shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle className="text-base tracking-tight">Focus activity</CardTitle><CardDescription className="mt-1">Study time across your selected period</CardDescription></div><span className="rounded-lg bg-[#efeafd] p-2 text-[#6b3fd8]"><BarChart3 size={17} /></span></CardHeader>
              <CardContent><div className="mb-1 flex items-baseline gap-2"><strong className="text-2xl tracking-[-.05em]">{hm(total)}</strong><span className="text-xs text-[#777187]">total focus</span></div><ActivityChart points={chartPoints} /><div className="mt-2 flex items-center justify-between text-[11px] text-[#777187]"><span>{range === 'all' ? 'Monthly · last 12 months' : range === '90d' ? 'Weekly · last 90 days' : `Daily · last ${range === '7d' ? 'week' : 'month'}`}</span><span>{count} sessions</span></div></CardContent>
            </Card>

            <Card className="border-[#ece9f2] shadow-sm">
              <CardHeader><CardTitle className="text-base tracking-tight">Today's goal</CardTitle><CardDescription>Set a daily target and build a consistent routine</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3"><div className="flex items-end justify-between gap-4"><div><p className="text-2xl font-semibold tracking-[-.05em]">{hm(todayTotal)}</p><p className="mt-1 text-xs text-[#777187]">of {hm(goalSec)} daily target</p></div><span className="text-2xl font-semibold tabular-nums">{Math.round(Math.min(100, goalPercent))}%</span></div><Progress value={goalPercent} className="h-3" /><p className="text-xs font-semibold text-[#6b3fd8]">{goalPercent >= 100 ? 'Goal completed today!' : `${hm(Math.max(0, goalSec - todayTotal))} left to reach your goal`}</p></div>
                <div className="mt-5 border-t border-[#ece9f2] pt-4"><div className="mb-2 flex items-center justify-between text-xs"><label htmlFor="goal-minutes" className="font-semibold">Daily goal</label><span className="text-[#777187]">{goalMinutes} min</span></div><input id="goal-minutes" type="range" min={15} max={360} step={15} value={goalMinutes} onChange={(e) => setGoalMinutes(Number(e.target.value))} className="w-full accent-[#6b3fd8]" /><div className="mt-1 flex justify-between text-[10px] text-[#777187]"><span>15 min</span><span>6 hours</span></div></div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
            <Card className="border-[#ece9f2] shadow-sm">
              <CardHeader><CardTitle className="text-base tracking-tight">Consistency map</CardTitle><CardDescription>Your last 12 weeks of study activity</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2">
                  {heatmap.map((d) => { const level = d.value === 0 ? 0 : d.value < 1800 ? 1 : d.value < 3600 ? 2 : d.value < 7200 ? 3 : 4; const colors = ['bg-[#f0edf5]', 'bg-[#e3d8ff]', 'bg-[#c7b4ff]', 'bg-[#9876ed]', 'bg-[#6b3fd8]']; return <div key={dateKey(d.date)} title={`${dateLabel(d.date, { dateStyle: 'medium' })}: ${hm(d.value)}`} className={`size-3 rounded-[3px] ${colors[level]}`} /> })}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#777187]"><span>{activeDays} active days in selected range</span><div className="flex items-center gap-1.5"><span>Less</span>{['bg-[#f0edf5]', 'bg-[#e3d8ff]', 'bg-[#c7b4ff]', 'bg-[#9876ed]', 'bg-[#6b3fd8]'].map((c) => <span key={c} className={`size-3 rounded-[3px] ${c}`} />)}<span>More</span></div></div>
              </CardContent>
            </Card>
            <Card className="border-[#ece9f2] shadow-sm"><CardHeader><CardTitle className="text-base tracking-tight">When you study</CardTitle><CardDescription>Focus time by time of day</CardDescription></CardHeader><CardContent><Bars items={hourData} /></CardContent></Card>
          </section>

          <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="border-[#ece9f2] shadow-sm"><CardHeader><CardTitle className="text-base tracking-tight">Best study days</CardTitle><CardDescription>Focus time by weekday</CardDescription></CardHeader><CardContent><Bars items={weekdayData} /></CardContent></Card>
            <Card className="border-[#ece9f2] shadow-sm"><CardHeader><CardTitle className="text-base tracking-tight">Personal records</CardTitle><CardDescription>Your strongest study moments</CardDescription></CardHeader><CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-[#f8f6fc] p-3"><span className="grid size-9 place-items-center rounded-lg bg-[#efeafd] text-[#6b3fd8]"><Trophy size={17} /></span><div className="min-w-0 flex-1"><p className="text-xs text-[#777187]">Longest session</p><strong className="text-lg">{longest ? hm(duration(longest)) : '—'}</strong></div></div>
              <div className="flex items-center gap-3 rounded-xl bg-[#f8f6fc] p-3"><span className="grid size-9 place-items-center rounded-lg bg-[#fff1d8] text-[#9a6713]"><CalendarDays size={17} /></span><div className="min-w-0 flex-1"><p className="text-xs text-[#777187]">Best day in period</p><strong className="text-lg">{bestDay ? hm(bestDay[1]) : '—'}</strong><p className="truncate text-[11px] text-[#777187]">{bestDay ? dateLabel(new Date(bestDay[0]), { dateStyle: 'medium' }) : 'No sessions yet'}</p></div></div>
              <div className="flex items-center gap-3 rounded-xl bg-[#f8f6fc] p-3"><span className="grid size-9 place-items-center rounded-lg bg-[#e7f4ec] text-[#39865e]"><Flame size={17} /></span><div className="min-w-0 flex-1"><p className="text-xs text-[#777187]">Current streak</p><strong className="text-lg">{streak} days</strong></div></div>
            </CardContent></Card>
            <Card className="border-[#ece9f2] shadow-sm"><CardHeader><CardTitle className="text-base tracking-tight">Weekly leaderboard</CardTitle><CardDescription>Study time with your community</CardDescription></CardHeader><CardContent>
              {leaderboardEntries.length ? <div className="space-y-2">{leaderboardEntries.slice(0, 5).map((entry, i) => <div key={entry.user_id} className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs ${entry.user_id === user.id ? 'bg-[#efeafd]' : ''}`}><span className="w-5 text-center text-[#777187]">{i + 1}</span><span className="min-w-0 flex-1 truncate font-medium">{entry.name}{entry.user_id === user.id ? ' · you' : ''}</span><strong>{hm(entry.total_sec)}</strong></div>)}{myRank && <div className="mt-3 border-t border-[#ece9f2] pt-3 text-xs text-[#777187]">Your rank <strong className="float-right text-[#1c1825]">{myRank.rank ? `#${myRank.rank}` : 'Not ranked'}</strong></div>}</div> : <div className="rounded-xl border border-dashed p-4 text-xs leading-relaxed text-[#777187]">Leaderboard will appear when weekly study activity is available.</div>}
            </CardContent></Card>
          </section>
        </> : (
          <Card className="mb-4 border-[#ece9f2] shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-base tracking-tight">Session history</CardTitle><CardDescription className="mt-1">Review completed focus sessions</CardDescription></div><div className="relative w-full sm:max-w-xs"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777187]" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by session date…" className="pl-9 text-xs" /></div></CardHeader>
            <CardContent><div className="overflow-x-auto"><Table className="min-w-[540px]"><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Start time</TableHead><TableHead className="text-right">Duration</TableHead><TableHead className="text-right">End time</TableHead></TableRow></TableHeader><TableBody>{sessionRows.map((s) => { const from = new Date(s.started_at), to = s.ended_at ? new Date(s.ended_at) : new Date(from.getTime() + duration(s) * 1000); return <TableRow key={s.id}><TableCell className="text-xs font-medium">{dateLabel(from, { dateStyle: 'medium' })}</TableCell><TableCell className="text-xs text-[#777187]">{dateLabel(from, { hour: 'numeric', minute: '2-digit' })}</TableCell><TableCell className="text-right text-xs font-semibold tabular-nums">{hm(duration(s))}</TableCell><TableCell className="text-right text-xs text-[#777187]">{dateLabel(to, { hour: 'numeric', minute: '2-digit' })}</TableCell></TableRow>})}</TableBody></Table>{!sessionRows.length && <div className="py-12 text-center text-sm text-[#777187]">No sessions match this range and search.</div>}{selected.length > sessionRows.length && <p className="mt-4 text-center text-xs text-[#777187]">Showing {sessionRows.length} of {selected.length} sessions. Change the range to see more.</p></div></CardContent>
          </Card>
        )}

        <footer className="mt-6 flex flex-col justify-between gap-2 border-t border-[#ece9f2] pt-4 text-xs text-[#8c849f] sm:flex-row sm:items-center"><span className="inline-flex items-center gap-1.5"><CalendarRange size={13} /> Analytics from your saved study sessions</span><span>Updated {dateLabel(new Date(), { hour: 'numeric', minute: '2-digit' })}</span></footer>
      </div>
    </main>
  )
}
