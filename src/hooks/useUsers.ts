import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createUser, deleteUser, getUserById, listUsers, updateUser } from '@/api/users'
import { getUserErrorMessage } from '@/pages/users/user-error-messages'
import type { CreateUserInput, UpdateUserInput } from '@/types/entities'

export function useUsersList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['users', 'list', params.page, params.limit],
    queryFn: () => listUsers(params),
    placeholderData: (previous) => previous,
  })
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => getUserById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserInput) => createUser(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario creado', { description: created.username })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserInput }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario actualizado')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario eliminado')
    },
    onError: (error) => toast.error(getUserErrorMessage(error)),
  })
}
