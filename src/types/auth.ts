export type UserRole = 'ADMIN' | 'RESEARCHER'

export type UserStatus = 'ACTIVE' | 'INACTIVE'

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
