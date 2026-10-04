import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateProtocolReviewInput, ProtocolReview } from '@/types/entities'

export function listProtocolReviews(protocolId: string, params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<ProtocolReview>>(`/protocols/${protocolId}/reviews${qs ? `?${qs}` : ''}`)
}

export function createProtocolReview(protocolId: string, payload: CreateProtocolReviewInput) {
  return apiFetch<ProtocolReview>(`/protocols/${protocolId}/reviews`, {
    method: 'POST',
    body: payload,
  })
}
