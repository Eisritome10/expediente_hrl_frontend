import type { Modality } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesModalitySearch(modality: Modality, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  return normalize(modality.name).includes(query)
}
