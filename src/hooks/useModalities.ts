import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createModality, deleteModality, getModalityById, listModalities, updateModality } from '@/api/modalities'
import type { CreateModalityInput, UpdateModalityInput } from '@/types/entities'

export function useModalitiesList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['modalities', 'list', params.page, params.limit],
    queryFn: () => listModalities(params),
    placeholderData: (previous) => previous,
  })
}

export function useModality(id: string | null) {
  return useQuery({
    queryKey: ['modalities', 'detail', id],
    queryFn: () => getModalityById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateModality() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateModalityInput) => createModality(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modalities'] }),
  })
}

export function useUpdateModality() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateModalityInput }) => updateModality(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modalities'] }),
  })
}

export function useDeleteModality() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteModality(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modalities'] }),
  })
}
