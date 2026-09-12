import type { Researcher } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesResearcherSearch(researcher: Researcher, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  const fullName = `${researcher.firstName} ${researcher.lastName}`
  const fields = [researcher.dni, fullName, researcher.email ?? '', researcher.phone ?? '']

  return fields.some((field) => normalize(field).includes(query))
}
