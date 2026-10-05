import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type {
  CreateInstitutionFacultyInput,
  CreateInstitutionInput,
  Faculty,
  Institution,
  UpdateInstitutionInput,
} from '@/types/entities'

export function listInstitutions(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<Institution>>(`/institutions${qs ? `?${qs}` : ''}`)
}

export function getInstitutionById(id: string) {
  return apiFetch<Institution>(`/institutions/${id}`)
}

export function createInstitution(payload: CreateInstitutionInput) {
  return apiFetch<Institution>('/institutions', { method: 'POST', body: payload })
}

export function updateInstitution(id: string, payload: UpdateInstitutionInput) {
  return apiFetch<Institution>(`/institutions/${id}`, { method: 'PATCH', body: payload })
}

export function deleteInstitution(id: string) {
  return apiFetch<void>(`/institutions/${id}`, { method: 'DELETE' })
}

export function listInstitutionFaculties(institutionId: string) {
  return apiFetch<Faculty[]>(`/institutions/${institutionId}/faculties`)
}

export function createInstitutionFaculty(institutionId: string, payload: CreateInstitutionFacultyInput) {
  return apiFetch<Faculty>(`/institutions/${institutionId}/faculties`, { method: 'POST', body: payload })
}

export function deleteInstitutionFaculty(institutionId: string, facultyId: string) {
  return apiFetch<void>(`/institutions/${institutionId}/faculties/${facultyId}`, { method: 'DELETE' })
}
