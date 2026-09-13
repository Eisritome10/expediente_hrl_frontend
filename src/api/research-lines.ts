import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { LineType, ResearchLine } from '@/types/entities'

export function listResearchLines(params: { type?: LineType; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<ResearchLine>>(`/research-lines${qs ? `?${qs}` : ''}`)
}
