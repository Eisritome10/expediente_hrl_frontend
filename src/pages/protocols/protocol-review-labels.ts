import type { Committee, ObservationType, ReviewOutcome } from '@/types/entities'

export const COMMITTEE_NAMES: Record<Committee, string> = {
  CIC: 'Comité de Investigación Clínica (CIC)',
  CIEI: 'Comité de Ética en Investigación (CIEI)',
}

export const OUTCOME_LABELS: Record<ReviewOutcome, { label: string; tone: 'warning' | 'success' | 'info' }> = {
  OBSERVED: { label: 'Observado', tone: 'warning' },
  APPROVED: { label: 'Aprobado', tone: 'info' },
  FINALIZED: { label: 'Finalizado con aprobación ética', tone: 'success' },
}

export const OBSERVATION_TYPE_LABELS: Record<ObservationType, string> = {
  INFORMED_CONSENT: 'Consentimiento informado',
  ETHICS_CONSTANCE: 'Constancia ética (redacción de documentos)',
  ADMINISTRATIVE: 'Administrativa / documentos',
  METHODOLOGICAL: 'Metodológica',
  LEGAL_INSTITUTIONAL: 'Legal / institucional',
}

/** Orden en que se ofrecen los tipos al registrar una observación. */
export const OBSERVATION_TYPES = Object.keys(OBSERVATION_TYPE_LABELS) as ObservationType[]

/** Las observaciones de dictámenes anteriores a la clasificación por tipo se muestran como "General". */
export function observationTypeLabel(type: ObservationType | null) {
  return type ? OBSERVATION_TYPE_LABELS[type] : 'General'
}

export function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}
