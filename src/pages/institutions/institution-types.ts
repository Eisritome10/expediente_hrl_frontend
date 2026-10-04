import type { InstitutionType } from '@/types/entities'

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  HOSPITAL: 'Hospital',
  UNIVERSITY: 'Universidad',
  OTHER: 'Otra',
}

export const INSTITUTION_TYPE_DESCRIPTIONS: Record<InstitutionType, string> = {
  HOSPITAL: 'Solo se registra el nombre.',
  UNIVERSITY: 'Tiene facultades propias, que se registran a mano para cada universidad.',
  OTHER: 'Institutos, asociaciones u otras entidades. Solo se registra el nombre.',
}

export const INSTITUTION_TYPES = Object.keys(INSTITUTION_TYPE_LABELS) as InstitutionType[]
