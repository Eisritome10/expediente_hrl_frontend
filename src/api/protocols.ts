import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type {
  CreateProtocolInput,
  Protocol,
  ProtocolListFilters,
  ProtocolSummary,
  ResearcherProtocolDetail,
  UpdateProtocolInput,
} from '@/types/entities'

export function listProtocols(params: { page?: number; limit?: number } & ProtocolListFilters = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.nroExpediente) query.set('nroExpediente', params.nroExpediente)
  if (params.investigadorPrincipalId) query.set('investigadorPrincipalId', params.investigadorPrincipalId)
  if (params.fechaRecepcionDesde) query.set('fechaRecepcionDesde', params.fechaRecepcionDesde)
  if (params.fechaRecepcionHasta) query.set('fechaRecepcionHasta', params.fechaRecepcionHasta)
  if (params.status) query.set('status', params.status)
  const qs = query.toString()
  return apiFetch<Paginated<Protocol>>(`/protocols${qs ? `?${qs}` : ''}`)
}

export function getProtocolById(id: string) {
  return apiFetch<Protocol>(`/protocols/${id}`)
}

export function createProtocol(payload: CreateProtocolInput) {
  return apiFetch<Protocol>('/protocols', { method: 'POST', body: payload })
}

export function updateProtocol(id: string, payload: UpdateProtocolInput) {
  return apiFetch<Protocol>(`/protocols/${id}`, { method: 'PATCH', body: payload })
}


export function listMyProtocols(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<ProtocolSummary>>(`/protocols/mine${qs ? `?${qs}` : ''}`)
}

export function getMyProtocolById(id: string) {
  return apiFetch<ResearcherProtocolDetail>(`/protocols/mine/${id}`)
}
