export type UserRole = 'ADMIN' | 'RESEARCHER'

export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface SessionUser {
  id: string
  username: string
  email?: string | null
  role: UserRole
  personId?: string | null
}

export interface AuthenticatedSession {
  accessToken: string
  refreshToken: string
  user: SessionUser
}
