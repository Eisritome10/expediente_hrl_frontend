import type { Destination } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesDestinationSearch(destination: Destination, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  return normalize(destination.description).includes(query)
}
