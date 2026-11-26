import Link from 'next/link'

export default function Header({ name, streak, page }: { name?: string; streak?: number; page: 'home' | 'dash' }) {
  const out = async () => { await fetch('/api/login', { method: 'DELETE' }); location.href = '/login' }
  return (
    <header className="bar">
      <div className="pill">
        <span className="heart" aria-hidden="true">
        <img
          src="/icon.svg"
          alt=""
          width={18}
          height={18}
        />
      </span> Hi, {name ?? '…'}</div>
      <div className="right">
        <button className="pill" onClick={out}>Log out</button>
        <div className="pill"><span aria-hidden>🔥</span> {streak ?? 0}</div>
        {page === 'home' ? <Link className="pill solid" href="/">Timer</Link> : <Link className="pill solid" href="/dashboard">Dashboard</Link>}
      </div>
    </header>
  )
}
