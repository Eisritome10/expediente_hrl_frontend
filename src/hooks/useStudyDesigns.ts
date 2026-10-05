import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createStudyDesign,
  deleteStudyDesign,
  getStudyDesignById,
  listStudyDesigns,
  updateStudyDesign,
} from '@/api/study-designs'
import { getStudyDesignErrorMessage } from '@/pages/study-designs/study-design-error-messages'
import type { CreateStudyDesignInput, UpdateStudyDesignInput } from '@/types/entities'

export function useStudyDesignsList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['study-designs', 'list', params.page, params.limit],
    queryFn: () => listStudyDesigns(params),
    placeholderData: (previous) => previous,
  })
}

export function useStudyDesign(id: string | null) {
  return useQuery({
    queryKey: ['study-designs', 'detail', id],
    queryFn: () => getStudyDesignById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateStudyDesign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStudyDesignInput) => createStudyDesign(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['study-designs'] })
      toast.success('Diseño de estudio creado', { description: created.name })
    },
  })
}

export function useUpdateStudyDesign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudyDesignInput }) => updateStudyDesign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-designs'] })
      toast.success('Diseño de estudio actualizado')
    },
  })
}

export function useDeleteStudyDesign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteStudyDesign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-designs'] })
      toast.success('Diseño de estudio eliminado')
    },
    onError: (error) => toast.error(getStudyDesignErrorMessage(error)),
  })
}
