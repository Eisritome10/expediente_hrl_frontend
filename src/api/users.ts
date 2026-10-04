import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateUserInput, UpdateUserInput, User } from '@/types/entities'

export function listUsers(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<User>>(`/users${qs ? `?${qs}` : ''}`)
}

export function getUserById(id: string) {
  return apiFetch<User>(`/users/${id}`)
}

export function createUser(payload: CreateUserInput) {
  return apiFetch<User>('/users', { method: 'POST', body: payload })
}

export function updateUser(id: string, payload: UpdateUserInput) {
  return apiFetch<User>(`/users/${id}`, { method: 'PATCH', body: payload })
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/users/${id}`, { method: 'DELETE' })
}
