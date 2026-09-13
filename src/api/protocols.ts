import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateProtocolInput, Protocol, ProtocolListFilters } from '@/types/entities'

export function listProtocols(params: { page?: number; limit?: number } & ProtocolListFilters = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.nroExpediente) query.set('nroExpediente', params.nroExpediente)
  if (params.investigadorPrincipalId) query.set('investigadorPrincipalId', params.investigadorPrincipalId)
  if (params.fechaRecepcionDesde) query.set('fechaRecepcionDesde', params.fechaRecepcionDesde)
  if (params.fechaRecepcionHasta) query.set('fechaRecepcionHasta', params.fechaRecepcionHasta)
  const qs = query.toString()
  return apiFetch<Paginated<Protocol>>(`/protocols${qs ? `?${qs}` : ''}`)
}

export function getProtocolById(id: string) {
  return apiFetch<Protocol>(`/protocols/${id}`)
}

export function createProtocol(payload: CreateProtocolInput) {
  return apiFetch<Protocol>('/protocols', { method: 'POST', body: payload })
}
