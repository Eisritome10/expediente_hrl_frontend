import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAgreement,
  deleteAgreement,
  getAgreementById,
  listAgreements,
  updateAgreement,
} from '@/api/agreements'
import { getAgreementErrorMessage } from '@/pages/agreements/agreement-error-messages'
import type { CreateAgreementInput, UpdateAgreementInput } from '@/types/entities'

export function useAgreementsList(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['agreements', 'list', params.page ?? 1, params.limit ?? 20],
    queryFn: () => listAgreements(params),
    placeholderData: (previous) => previous,
  })
}

export function useAgreement(id: string | null) {
  return useQuery({
    queryKey: ['agreements', 'detail', id],
    queryFn: () => getAgreementById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateAgreement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAgreementInput) => createAgreement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreements'] })
      toast.success('Convenio creado')
    },
  })
}

export function useUpdateAgreement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgreementInput }) => updateAgreement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreements'] })
      toast.success('Convenio actualizado')
    },
  })
}

export function useDeleteAgreement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAgreement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreements'] })
      toast.success('Convenio eliminado')
    },
    onError: (error) => toast.error(getAgreementErrorMessage(error)),
  })
}
