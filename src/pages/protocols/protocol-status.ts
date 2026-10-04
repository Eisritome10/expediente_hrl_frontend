import type { ProtocolStatus } from '@/types/entities'

export type ProtocolStatusTone = 'neutral' | 'brand' | 'warning' | 'success' | 'danger' | 'info'

export const PROTOCOL_STATUS_CONFIG: Record<ProtocolStatus, { label: string; tone: ProtocolStatusTone }> = {
  CREATED: { label: 'Creado', tone: 'neutral' },
  CIC_OBSERVED: { label: 'Observado CIC', tone: 'warning' },
  CIC_CORRECTED: { label: 'Corregido CIC', tone: 'info' },
  CIEI_OBSERVED: { label: 'Observado CIEI', tone: 'danger' },
  CIEI_CORRECTED: { label: 'Corregido CIEI', tone: 'brand' },
  FINALIZED: { label: 'Finalizado', tone: 'success' },
}

export const PROTOCOL_STATUSES = Object.keys(PROTOCOL_STATUS_CONFIG) as ProtocolStatus[]

/** Qué significa cada estado para quien investiga y qué le toca hacer, en una línea. */
export const RESEARCHER_STATUS_HINT: Record<ProtocolStatus, string> = {
  CREATED: 'Registrado y en evaluación.',
  CIC_OBSERVED: 'El CIC dejó observaciones. Acércate a la OADI para corregirlas.',
  CIC_CORRECTED: 'Observaciones del CIC corregidas, pendiente de nueva revisión.',
  CIEI_OBSERVED: 'El CIEI dejó observaciones. Acércate a la OADI para corregirlas.',
  CIEI_CORRECTED: 'Observaciones del CIEI corregidas, pendiente de nueva revisión.',
  FINALIZED: 'Proceso concluido.',
}
