import type { Agreement } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesAgreementSearch(agreement: Agreement, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  return normalize(agreement.name).includes(query)
}
