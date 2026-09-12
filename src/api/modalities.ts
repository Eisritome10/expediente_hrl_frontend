import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateModalityInput, Modality, UpdateModalityInput } from '@/types/entities'

export function listModalities(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<Modality>>(`/modalities${qs ? `?${qs}` : ''}`)
}

export function getModalityById(id: string) {
  return apiFetch<Modality>(`/modalities/${id}`)
}

export function createModality(payload: CreateModalityInput) {
  return apiFetch<Modality>('/modalities', { method: 'POST', body: payload })
}

export function updateModality(id: string, payload: UpdateModalityInput) {
  return apiFetch<Modality>(`/modalities/${id}`, { method: 'PATCH', body: payload })
}

export function deleteModality(id: string) {
  return apiFetch<void>(`/modalities/${id}`, { method: 'DELETE' })
}
