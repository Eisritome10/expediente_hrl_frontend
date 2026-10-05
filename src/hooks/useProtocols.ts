import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createProtocol,
  getMyProtocolById,
  getProtocolById,
  listMyProtocols,
  listProtocols,
  updateProtocol,
} from '@/api/protocols'
import { ApiError } from '@/types/common'
import type { CreateProtocolInput, ProtocolListFilters, UpdateProtocolInput } from '@/types/entities'

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
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      toast.success('Protocolo registrado', { description: `Expediente ${created.nroExpediente}` })
    },
  })
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProtocolInput }) => updateProtocol(id, payload),
    onSuccess: (protocol) => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      queryClient.setQueryData(['protocols', 'detail', protocol.id], protocol)
      toast.success('Protocolo actualizado')
    },
  })
}


export function useMyProtocolsList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['protocols', 'mine', params],
    queryFn: () => listMyProtocols(params),
    placeholderData: (previous) => previous,
    // Un 403 (cuenta sin investigador vinculado) no se arregla reintentando.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 403) && failureCount < 2,
  })
}

export function useMyProtocol(id: string | null) {
  return useQuery({
    queryKey: ['protocols', 'mine', 'detail', id],
    queryFn: () => getMyProtocolById(id as string),
    enabled: Boolean(id),
    // Un 403 (cuenta sin investigador vinculado) o un 404 (ajeno/inexistente) no se arreglan reintentando.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && (error.status === 403 || error.status === 404)) && failureCount < 2,
  })
}
