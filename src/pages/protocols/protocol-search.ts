import type { Protocol } from '@/types/entities'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesProtocolSearch(protocol: Protocol, term: string): boolean {
  const query = normalize(term)
  if (!query) return true

  const investigadorPrincipal = `${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}`

  return (
    normalize(protocol.nroExpediente).includes(query) ||
    normalize(protocol.titulo).includes(query) ||
    normalize(investigadorPrincipal).includes(query)
  )
}
