import { apiFetch } from '@/api/client'
import type { AuthenticatedSession } from '@/types/auth'

export function login(identifier: string, password: string) {
  return apiFetch<AuthenticatedSession>('/auth/login', {
    method: 'POST',
    body: { identifier, password },
    auth: false,
  })
}
