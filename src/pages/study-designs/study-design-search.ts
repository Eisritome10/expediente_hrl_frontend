import type { StudyDesign } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesStudyDesignSearch(studyDesign: StudyDesign, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  return normalize(studyDesign.name).includes(query)
}
