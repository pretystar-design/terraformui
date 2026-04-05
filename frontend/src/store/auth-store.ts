import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setToken: (token: string) => void
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('tfg_token'),
  isAuthenticated: !!localStorage.getItem('tfg_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await res.json()
      localStorage.setItem('tfg_token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    const token = localStorage.getItem('tfg_token')
    if (token) {
      try {
        await fetch(`${API_BASE}/api/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem('tfg_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('tfg_token')
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false })
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/whoami`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        localStorage.removeItem('tfg_token')
        set({ user: null, token: null, isAuthenticated: false })
        return
      }

      const data = await res.json()
      if (data.authenticated) {
        set({ user: data.user, token, isAuthenticated: true })
      } else {
        localStorage.removeItem('tfg_token')
        set({ user: null, token: null, isAuthenticated: false })
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  setToken: (token) => {
    localStorage.setItem('tfg_token', token)
    set({ token, isAuthenticated: true })
  },
}))

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('tfg_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
