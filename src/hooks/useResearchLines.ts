import { useQuery } from '@tanstack/react-query'
import { listResearchLines } from '@/api/research-lines'
import type { LineType } from '@/types/entities'

const CATALOG_FETCH_LIMIT = 100

export function useResearchLinesByType(type: LineType) {
  return useQuery({
    queryKey: ['research-lines', 'list', type],
    queryFn: () => listResearchLines({ type, page: 1, limit: CATALOG_FETCH_LIMIT }),
  })
}
