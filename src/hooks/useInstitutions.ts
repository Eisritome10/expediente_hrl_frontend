import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createInstitution,
  createInstitutionFaculty,
  deleteInstitution,
  deleteInstitutionFaculty,
  getInstitutionById,
  listInstitutionFaculties,
  listInstitutions,
  updateInstitution,
} from '@/api/institutions'
import { getInstitutionErrorMessage } from '@/pages/institutions/institution-error-messages'
import type { CreateInstitutionFacultyInput, CreateInstitutionInput, UpdateInstitutionInput } from '@/types/entities'

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
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
      toast.success('Institución creada', { description: created.name })
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

/** Facultades de una universidad (cada universidad tiene las suyas). */
export function useInstitutionFaculties(institutionId: string | null, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['institutions', 'faculties', institutionId],
    queryFn: () => listInstitutionFaculties(institutionId as string),
    enabled: Boolean(institutionId) && (options.enabled ?? true),
  })
}

export function useCreateInstitutionFaculty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ institutionId, payload }: { institutionId: string; payload: CreateInstitutionFacultyInput }) =>
      createInstitutionFaculty(institutionId, payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['institutions', 'faculties'] })
      toast.success('Facultad agregada', { description: created.name })
    },
  })
}

export function useDeleteInstitutionFaculty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ institutionId, facultyId }: { institutionId: string; facultyId: string }) =>
      deleteInstitutionFaculty(institutionId, facultyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions', 'faculties'] })
      toast.success('Facultad eliminada')
    },
    onError: (error) => toast.error(getInstitutionErrorMessage(error)),
  })
}
