import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateResearcherInput, Researcher, UpdateResearcherInput } from '@/types/entities'

export function listResearchers(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<Researcher>>(`/researchers${qs ? `?${qs}` : ''}`)
}

export function getResearcherById(id: string) {
  return apiFetch<Researcher>(`/researchers/${id}`)
}

export function createResearcher(payload: CreateResearcherInput) {
  return apiFetch<Researcher>('/researchers', { method: 'POST', body: payload })
}

export function updateResearcher(id: string, payload: UpdateResearcherInput) {
  return apiFetch<Researcher>(`/researchers/${id}`, { method: 'PATCH', body: payload })
}

export function deleteResearcher(id: string) {
  return apiFetch<void>(`/researchers/${id}`, { method: 'DELETE' })
}
