import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createProtocol, getProtocolById, listProtocols } from '@/api/protocols'
import type { CreateProtocolInput, ProtocolListFilters } from '@/types/entities'

export function useProtocolsList(params: { page: number; limit: number } & ProtocolListFilters) {
  return useQuery({
    queryKey: ['protocols', 'list', params],
    queryFn: () => listProtocols(params),
    placeholderData: (previous) => previous,
  })
}

export function useProtocol(id: string | null) {
  return useQuery({
    queryKey: ['protocols', 'detail', id],
    queryFn: () => getProtocolById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateProtocol() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProtocolInput) => createProtocol(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      toast.success('Protocolo registrado')
    },
  })
}
