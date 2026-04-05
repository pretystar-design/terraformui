import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/components/auth/login-page'
import { useAuthStore } from '@/store/auth-store'

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <AppLayout /> : <LoginPage />
}
