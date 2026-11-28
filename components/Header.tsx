
'use client'

import Link from 'next/link'
import { Flame, LogOut, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

type HeaderProps = {
  name?: string
  streak?: number
  page: 'home' | 'dash'
}

export default function Header({
  name,
  streak,
  page,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])
  const out = async () => {
    try {
      await fetch('/api/login', { method: 'DELETE' })
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      
<div className="flex items-center gap-2">
  <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-sans text-sm font-medium text-card-foreground">
    <img
      src="/icon.svg"
      alt=""
      width={18}
      height={18}
      className="shrink-0"
    />
    <span className="max-w-[180px] truncate">
      Hi, {name ?? '…'}
    </span>
  </div>

  {mounted && (
    <Button
      variant="outline"
      size="icon"
      onClick={() =>
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }
      aria-label="Toggle theme"
      title="Toggle theme"
      className="size-9 border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {theme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  )}
</div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={out}
          aria-label="Log out"
          title="Log out"
          className="size-8 border-border bg-card p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="size-4" />
        </Button>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber/30 bg-amber/10 px-3 font-sans text-sm font-semibold text-[var(--s3-amber-ink)]">
          <Flame className="size-4 text-amber" />
          <span className="tabular-nums">{streak ?? 0}</span>
        </span>
        {page === 'home' ? (
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-foreground px-3 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-s3-ink-2"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-foreground px-3 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-s3-ink-2"
          >
            Timer
          </Link>
        )}
      </div>
    </header>
  )
}
