import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { Agreement, CreateAgreementInput, UpdateAgreementInput } from '@/types/entities'

export function listAgreements(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<Agreement>>(`/agreements${qs ? `?${qs}` : ''}`)
}

export function getAgreementById(id: string) {
  return apiFetch<Agreement>(`/agreements/${id}`)
}

export function createAgreement(payload: CreateAgreementInput) {
  return apiFetch<Agreement>('/agreements', { method: 'POST', body: payload })
}

export function updateAgreement(id: string, payload: UpdateAgreementInput) {
  return apiFetch<Agreement>(`/agreements/${id}`, { method: 'PATCH', body: payload })
}

export function deleteAgreement(id: string) {
  return apiFetch<void>(`/agreements/${id}`, { method: 'DELETE' })
}
