import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createProtocolReview, listProtocolReviews } from '@/api/protocol-reviews'
import type { CreateProtocolReviewInput } from '@/types/entities'

export function useProtocolReviewsList(protocolId: string | null, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['protocol-reviews', protocolId, params],
    queryFn: () => listProtocolReviews(protocolId as string, params),
    enabled: Boolean(protocolId),
  })
}

export function useCreateProtocolReview(protocolId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProtocolReviewInput) => createProtocolReview(protocolId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      queryClient.invalidateQueries({ queryKey: ['protocol-reviews', protocolId] })
      toast.success('Dictamen de revisión registrado')
    },
  })
}
