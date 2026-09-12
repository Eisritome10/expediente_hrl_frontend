import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createResearcher,
  deleteResearcher,
  getResearcherById,
  listResearchers,
  updateResearcher,
} from '@/api/researchers'
import type { CreateResearcherInput, UpdateResearcherInput } from '@/types/entities'

export function useResearchersList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['researchers', 'list', params.page, params.limit],
    queryFn: () => listResearchers(params),
    placeholderData: (previous) => previous,
  })
}

export function useResearcher(id: string | null) {
  return useQuery({
    queryKey: ['researchers', 'detail', id],
    queryFn: () => getResearcherById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateResearcher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateResearcherInput) => createResearcher(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['researchers'] }),
  })
}

export function useUpdateResearcher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateResearcherInput }) =>
      updateResearcher(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['researchers'] }),
  })
}

export function useDeleteResearcher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteResearcher(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['researchers'] }),
  })
}
