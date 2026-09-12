export type UserRole = 'ADMIN' | 'NURSE' | 'DOCTOR' | 'STATISTICIAN'

export interface SessionUser {
  id: string
  username: string
  role: UserRole
}

export interface AuthenticatedSession {
  accessToken: string
  refreshToken: string
  user: SessionUser
}
