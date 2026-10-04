import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest } from '@/api/auth'
import { tokenStorage } from '@/api/token-storage'
import { ApiError } from '@/types/common'
import type { AuthenticatedSession, SessionUser } from '@/types/auth'

const SESSION_USER_KEY = 'hrl.sessionUser'

function readStoredUser(): SessionUser | null {
  const raw = localStorage.getItem(SESSION_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

interface AuthContextValue {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<SessionUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readStoredUser())

  const login = useCallback(async (identifier: string, password: string) => {
    let session: AuthenticatedSession
    try {
      session = await loginRequest(identifier, password)
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(0, { message: 'No se pudo conectar con el servidor.', statusCode: 0 })
    }

    tokenStorage.setTokens(session.accessToken, session.refreshToken)
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(session.user))
    setUser(session.user)
    return session.user
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    localStorage.removeItem(SESSION_USER_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
