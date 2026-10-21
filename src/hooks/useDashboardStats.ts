import { useQuery } from '@tanstack/react-query'
import { listResearchers } from '@/api/researchers'
import { listInstitutions } from '@/api/institutions'
import { getDashboardReport } from '@/api/protocols'

export function useResearcherCount() {
  return useQuery({
    queryKey: ['researchers', 'count'],
    queryFn: () => listResearchers({ limit: 1 }),
    select: (result) => result.meta.total,
  })
}

export function useInstitutionCount() {
  return useQuery({
    queryKey: ['institutions', 'count'],
    queryFn: () => listInstitutions({ limit: 1 }),
    select: (result) => result.meta.total,
  })
}

export function useDashboardReport(
  from?: string,
  to?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['dashboard', 'report', from ?? null, to ?? null],
    queryFn: () => getDashboardReport({ from, to }),
    retry: false,
    enabled,
  })
}
