import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateFacultyInput, Faculty, UpdateFacultyInput } from '@/types/entities'

export function listFaculties(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<Faculty>>(`/faculties${qs ? `?${qs}` : ''}`)
}

export function getFacultyById(id: string) {
  return apiFetch<Faculty>(`/faculties/${id}`)
}

export function createFaculty(payload: CreateFacultyInput) {
  return apiFetch<Faculty>('/faculties', { method: 'POST', body: payload })
}

export function updateFaculty(id: string, payload: UpdateFacultyInput) {
  return apiFetch<Faculty>(`/faculties/${id}`, { method: 'PATCH', body: payload })
}

export function deleteFaculty(id: string) {
  return apiFetch<void>(`/faculties/${id}`, { method: 'DELETE' })
}
