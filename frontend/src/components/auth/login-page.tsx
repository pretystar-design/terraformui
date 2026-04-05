import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/use-auth'

const DEMO_USERS = [
  { email: 'admin@tfg.local', password: 'admin', name: 'Admin User', role: 'admin' },
  { email: 'dev@tfg.local', password: 'dev', name: 'Developer', role: 'developer' },
  { email: 'viewer@tfg.local', password: 'viewer', name: 'Viewer', role: 'viewer' },
]

export function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState('admin@tfg.local')
  const [password, setPassword] = useState('admin')
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    try {
      await login(email, password)
    } catch {
      setLoginError(error || 'Invalid credentials')
    }
  }

  const quickLogin = async (user: typeof DEMO_USERS[0]) => {
    setLoginError(null)
    setEmail(user.email)
    setPassword(user.password)
    try {
      await login(user.email, user.password)
    } catch {
      setLoginError('Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-app)' }}>
      <div className="w-full max-w-md px-4">
        <div className="rounded-lg p-8 shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                <line x1="12" y1="22" x2="12" y2="15.5"/>
                <polyline points="22 8.5 12 15.5 2 8.5"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--accent-light)', letterSpacing: '-0.5px' }}>
              TF Visual
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="admin@tfg.local"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm" style={{ color: 'var(--red)' }}>{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="mb-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Demo accounts:</p>
            <div className="space-y-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => quickLogin(user)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs transition-colors hover:bg-[var(--bg-input)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--accent), #a855f7)' }}>
                      {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                    style={{ background: 'var(--green-dim)', color: 'var(--green)', letterSpacing: '0.5px' }}>
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
