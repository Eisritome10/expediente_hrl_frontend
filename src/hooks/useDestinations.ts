import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDestination,
  deleteDestination,
  getDestinationById,
  listDestinations,
  updateDestination,
} from '@/api/destinations'
import type { CreateDestinationInput, UpdateDestinationInput } from '@/types/entities'

export function useDestinationsList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['destinations', 'list', params.page, params.limit],
    queryFn: () => listDestinations(params),
    placeholderData: (previous) => previous,
  })
}

export function useDestination(id: string | null) {
  return useQuery({
    queryKey: ['destinations', 'detail', id],
    queryFn: () => getDestinationById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateDestination() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDestinationInput) => createDestination(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['destinations'] }),
  })
}

export function useUpdateDestination() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDestinationInput }) => updateDestination(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['destinations'] }),
  })
}

export function useDeleteDestination() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDestination(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['destinations'] }),
  })
}
