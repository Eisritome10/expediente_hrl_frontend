import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { Researcher } from '@/types/entities'

export function listResearchers(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<Researcher>>(`/researchers${qs ? `?${qs}` : ''}`)
}
