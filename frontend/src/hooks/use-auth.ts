import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogin = async (email: string, password: string) => {
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return { user, isAuthenticated, isLoading, error, login: handleLogin, logout: handleLogout }
}
