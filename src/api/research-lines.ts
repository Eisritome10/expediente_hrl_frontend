import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateResearchLineInput, LineType, ResearchLine, UpdateResearchLineInput } from '@/types/entities'

export function listResearchLines(params: { type?: LineType; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<ResearchLine>>(`/research-lines${qs ? `?${qs}` : ''}`)
}

export function getResearchLineById(id: string) {
  return apiFetch<ResearchLine>(`/research-lines/${id}`)
}

export function createResearchLine(payload: CreateResearchLineInput) {
  return apiFetch<ResearchLine>('/research-lines', { method: 'POST', body: payload })
}

export function updateResearchLine(id: string, payload: UpdateResearchLineInput) {
  return apiFetch<ResearchLine>(`/research-lines/${id}`, { method: 'PATCH', body: payload })
}

export function deleteResearchLine(id: string) {
  return apiFetch<void>(`/research-lines/${id}`, { method: 'DELETE' })
}
