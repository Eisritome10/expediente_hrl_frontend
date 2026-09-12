import type { Institution } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesInstitutionSearch(institution: Institution, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  const fields = [institution.name, institution.abbreviation ?? '']

  return fields.some((field) => normalize(field).includes(query))
}
