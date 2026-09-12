import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateDestinationInput, Destination, UpdateDestinationInput } from '@/types/entities'

export function listDestinations(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<Destination>>(`/destinations${qs ? `?${qs}` : ''}`)
}

export function getDestinationById(id: string) {
  return apiFetch<Destination>(`/destinations/${id}`)
}

export function createDestination(payload: CreateDestinationInput) {
  return apiFetch<Destination>('/destinations', { method: 'POST', body: payload })
}

export function updateDestination(id: string, payload: UpdateDestinationInput) {
  return apiFetch<Destination>(`/destinations/${id}`, { method: 'PATCH', body: payload })
}

export function deleteDestination(id: string) {
  return apiFetch<void>(`/destinations/${id}`, { method: 'DELETE' })
}
