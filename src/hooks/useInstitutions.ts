import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createInstitution,
  deleteInstitution,
  getInstitutionById,
  listInstitutions,
  updateInstitution,
} from '@/api/institutions'
import { getInstitutionErrorMessage } from '@/pages/institutions/institution-error-messages'
import type { CreateInstitutionInput, UpdateInstitutionInput } from '@/types/entities'

export function useInstitutionsList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['institutions', 'list', params.page, params.limit],
    queryFn: () => listInstitutions(params),
    placeholderData: (previous) => previous,
  })
}

export function useInstitution(id: string | null) {
  return useQuery({
    queryKey: ['institutions', 'detail', id],
    queryFn: () => getInstitutionById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateInstitutionInput) => createInstitution(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
      toast.success('Institución creada')
    },
  })
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInstitutionInput }) =>
      updateInstitution(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
      toast.success('Institución actualizada')
    },
  })
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteInstitution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
      toast.success('Institución eliminada')
    },
    onError: (error) => toast.error(getInstitutionErrorMessage(error)),
  })
}
