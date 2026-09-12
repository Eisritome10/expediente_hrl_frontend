import type { Faculty } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesFacultySearch(faculty: Faculty, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  return normalize(faculty.name).includes(query)
}
