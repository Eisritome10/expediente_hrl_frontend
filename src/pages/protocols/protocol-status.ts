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

/** Estados vistos por quien investiga: en palabras llanas y sin siglas de comités. */
export const RESEARCHER_STATUS_CONFIG: Record<ProtocolStatus, { label: string; tone: ProtocolStatusTone }> = {
  CREATED: { label: 'En evaluación', tone: 'brand' },
  CIC_OBSERVED: { label: 'Requiere corrección', tone: 'warning' },
  CIC_CORRECTED: { label: 'Corrección enviada', tone: 'info' },
  CIEI_OBSERVED: { label: 'Requiere corrección', tone: 'warning' },
  CIEI_CORRECTED: { label: 'Corrección enviada', tone: 'info' },
  FINALIZED: { label: 'Proceso concluido', tone: 'success' },
}

export const RESEARCHER_STATUSES = Object.keys(RESEARCHER_STATUS_CONFIG) as ProtocolStatus[]

/** Qué significa cada estado para quien investiga y qué le toca hacer, en una línea. */
export const RESEARCHER_STATUS_HINT: Record<ProtocolStatus, string> = {
  CREATED: 'Registrado y en evaluación.',
  CIC_OBSERVED: 'El Comité de Investigación Clínica dejó observaciones. Acércate a la oficina de investigación para corregirlas.',
  CIC_CORRECTED: 'Observaciones corregidas, pendiente de una nueva revisión del Comité de Investigación Clínica.',
  CIEI_OBSERVED: 'El Comité de Ética en Investigación dejó observaciones. Acércate a la oficina de investigación para corregirlas.',
  CIEI_CORRECTED: 'Observaciones corregidas, pendiente de una nueva revisión del Comité de Ética en Investigación.',
  FINALIZED: 'Proceso concluido con aprobación ética.',
}
