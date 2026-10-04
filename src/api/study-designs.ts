import { apiFetch } from '@/api/client'
import type { Paginated } from '@/types/common'
import type { CreateStudyDesignInput, StudyDesign, UpdateStudyDesignInput } from '@/types/entities'

export function listStudyDesigns(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<Paginated<StudyDesign>>(`/study-designs${qs ? `?${qs}` : ''}`)
}

export function getStudyDesignById(id: string) {
  return apiFetch<StudyDesign>(`/study-designs/${id}`)
}

export function createStudyDesign(payload: CreateStudyDesignInput) {
  return apiFetch<StudyDesign>('/study-designs', { method: 'POST', body: payload })
}

export function updateStudyDesign(id: string, payload: UpdateStudyDesignInput) {
  return apiFetch<StudyDesign>(`/study-designs/${id}`, { method: 'PATCH', body: payload })
}

export function deleteStudyDesign(id: string) {
  return apiFetch<void>(`/study-designs/${id}`, { method: 'DELETE' })
}
