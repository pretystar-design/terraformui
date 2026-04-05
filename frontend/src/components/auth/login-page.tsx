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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-primary">TF Visual</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin@tfg.local"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-500">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Demo accounts:</p>
            <div className="space-y-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => quickLogin(user)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs hover:bg-accent"
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground">{user.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
