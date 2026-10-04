import type { User } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesUserSearch(user: User, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  const fields = [user.username, user.fullName, user.email ?? '']

  return fields.some((field) => normalize(field).includes(query))
}
