import Link from 'next/link'
import { Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header({ name, streak, page }: { name?: string; streak?: number; page: 'home' | 'dash' }) {
  const out = async () => {
    await fetch('/api/login', { method: 'DELETE' })
    location.href = '/login'
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece9f2] pb-4">
      <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#dcd6e6] bg-white px-3 py-1.5 text-sm font-medium text-[#1c1825]">
        <img src="/icon.svg" alt="" width={18} height={18} />
        <span>Hi, {name ?? '…'}</span>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={out}>Log out</Button>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#f0d8a8] bg-[#fffaf0] px-3 text-sm font-semibold text-[#9a6713]">
          <Flame className="size-4" /> {streak ?? 0}
        </span>
        {page === 'home'
          ? <Link href="/" className="inline-flex h-8 items-center rounded-lg bg-[#1c1825] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#15112a]">Timer</Link>
          : <Link href="/dashboard" className="inline-flex h-8 items-center rounded-lg bg-[#1c1825] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#15112a]">Dashboard</Link>}
      </div>
    </header>
  )
}
