import { apiFetch } from '@/api/client'
import type { AuthenticatedSession } from '@/types/auth'

export function login(username: string, password: string) {
  return apiFetch<AuthenticatedSession>('/auth/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  })
}
