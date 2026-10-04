import type { LineType, ResearchLine } from '@/types/entities'

export const lineTypeLabels: Record<LineType, string> = {
  HRL: 'HRL',
  META_2030: 'Meta 2030',
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesResearchLineSearch(researchLine: ResearchLine, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  const fields = [researchLine.name, lineTypeLabels[researchLine.type]]

  return fields.some((field) => normalize(field).includes(query))
}
