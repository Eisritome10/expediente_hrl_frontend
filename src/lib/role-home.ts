import type { UserRole } from '@/types/auth'

/** Pantalla de inicio de cada rol: el panel administrativo solo existe para ADMIN. */
export function homePathForRole(role: UserRole): string {
  return role === 'RESEARCHER' ? '/mis-protocolos' : '/'
}
