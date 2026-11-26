'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('')
    const r = await fetch(`/api/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    const j = await r.json()
    if (!r.ok) return setMsg(j.error)
    if (mode === 'register') { setMode('login'); return setMsg('Account created. Check your email if confirmation is on, then log in.') }
    router.replace('/'); router.refresh()
  }
  return (
    <main className="auth">
      <form className="card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Log in' : 'Create account'}</h1>
        {mode === 'register' && <input placeholder="Name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
        <input type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input type="password" placeholder="Password (6+ characters)" minLength={6} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {msg && <p className="muted" role="alert">{msg}</p>}
        <button className="go">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
      </form>
    </main>
  )
}
