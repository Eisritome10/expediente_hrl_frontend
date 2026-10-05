import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createResearchLine,
  deleteResearchLine,
  getResearchLineById,
  listResearchLines,
  updateResearchLine,
} from '@/api/research-lines'
import { getResearchLineErrorMessage } from '@/pages/research-lines/research-line-error-messages'
import type { CreateResearchLineInput, LineType, UpdateResearchLineInput } from '@/types/entities'

const CATALOG_FETCH_LIMIT = 100

export function useResearchLinesByType(type: LineType) {
  return useQuery({
    queryKey: ['research-lines', 'list', type],
    queryFn: () => listResearchLines({ type, page: 1, limit: CATALOG_FETCH_LIMIT }),
  })
}

export function useResearchLinesList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['research-lines', 'list', 'all', params.page, params.limit],
    queryFn: () => listResearchLines(params),
    placeholderData: (previous) => previous,
  })
}

export function useResearchLine(id: string | null) {
  return useQuery({
    queryKey: ['research-lines', 'detail', id],
    queryFn: () => getResearchLineById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateResearchLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateResearchLineInput) => createResearchLine(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['research-lines'] })
      toast.success('Línea de investigación creada', { description: created.name })
    },
  })
}

export function useUpdateResearchLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateResearchLineInput }) => updateResearchLine(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-lines'] })
      toast.success('Línea de investigación actualizada')
    },
  })
}

export function useDeleteResearchLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteResearchLine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-lines'] })
      toast.success('Línea de investigación eliminada')
    },
    onError: (error) => toast.error(getResearchLineErrorMessage(error)),
  })
}
