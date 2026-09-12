import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFaculty, deleteFaculty, getFacultyById, listFaculties, updateFaculty } from '@/api/faculties'
import type { CreateFacultyInput, UpdateFacultyInput } from '@/types/entities'

export function useFacultiesList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['faculties', 'list', params.page, params.limit],
    queryFn: () => listFaculties(params),
    placeholderData: (previous) => previous,
  })
}

export function useFaculty(id: string | null) {
  return useQuery({
    queryKey: ['faculties', 'detail', id],
    queryFn: () => getFacultyById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateFaculty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFacultyInput) => createFaculty(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculties'] }),
  })
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFacultyInput }) => updateFaculty(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculties'] }),
  })
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFaculty(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculties'] }),
  })
}
