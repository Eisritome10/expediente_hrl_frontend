import type { UserRole, UserStatus } from '@/types/auth'

export interface Researcher {
  id: string
  dni: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateResearcherInput {
  dni: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export type UpdateResearcherInput = Partial<Omit<CreateResearcherInput, 'dni'>>

export type InstitutionType = 'HOSPITAL' | 'UNIVERSITY' | 'OTHER'

export interface Institution {
  id: string
  name: string
  abbreviation: string | null
  type: InstitutionType
  createdAt: string
  updatedAt: string
}

export interface CreateInstitutionInput {
  name: string
  abbreviation?: string
  type: InstitutionType
}

export type UpdateInstitutionInput = Partial<CreateInstitutionInput>

export interface Faculty {
  id: string
  name: string
  /** Universidad a la que pertenece; nulo solo en facultades históricas del catálogo global anterior. */
  institutionId: string | null
  institutionName: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateFacultyInput {
  name: string
  institutionId: string
}

/** La universidad de una facultad no cambia: solo se puede renombrar. */
export type UpdateFacultyInput = Partial<Pick<CreateFacultyInput, 'name'>>

export interface Destination {
  id: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface CreateDestinationInput {
  description: string
}

export type UpdateDestinationInput = Partial<CreateDestinationInput>

export interface Modality {
  id: string
  name: string
  fee: number
  createdAt: string
  updatedAt: string
}

export interface CreateModalityInput {
  name: string
  fee: number
}

export type UpdateModalityInput = Partial<CreateModalityInput>

export interface StudyDesign {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateStudyDesignInput {
  name: string
}

export type UpdateStudyDesignInput = Partial<CreateStudyDesignInput>

export type LineType = 'HRL' | 'META_2030'

export interface ResearchLine {
  id: string
  name: string
  type: LineType
  createdAt: string
  updatedAt: string
}

export interface CreateResearchLineInput {
  name: string
  type: LineType
}

export type UpdateResearchLineInput = Partial<CreateResearchLineInput>

export interface User {
  id: string
  username: string
  fullName: string
  email: string | null
  researcherId: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  username: string
  fullName: string
  password: string
  role?: UserRole
  status?: UserStatus
}

export interface UpdateUserInput {
  fullName?: string
  status?: UserStatus
}

export interface Agreement {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateAgreementInput {
  name: string
}

export type UpdateAgreementInput = Partial<CreateAgreementInput>

export type ProtocolStatus =
  | 'CREATED'
  | 'CIC_OBSERVED'
  | 'CIC_CORRECTED'
  | 'CIEI_OBSERVED'
  | 'CIEI_CORRECTED'
  | 'FINALIZED'

export type Committee = 'CIC' | 'CIEI'

export type ReviewOutcome = 'OBSERVED' | 'APPROVED' | 'FINALIZED'

export type RiskLevel = 'NO_RISK' | 'MINIMAL_RISK' | 'MODERATE_RISK' | 'HIGH_RISK'

export type ObservationType =
  | 'INFORMED_CONSENT'
  | 'ETHICS_CONSTANCE'
  | 'ADMINISTRATIVE'
  | 'METHODOLOGICAL'
  | 'LEGAL_INSTITUTIONAL'
  | 'OTHER'

/** Una observación de un dictamen. `type` es null en dictámenes anteriores a la clasificación por tipo. */
export interface ProtocolReviewObservation {
  type: ObservationType | null
  text: string
}

export interface ProtocolRelatedResearcher {
  id: string
  dni: string
  firstName: string
  lastName: string
}

export interface ProtocolRelatedEntity {
  id: string
  name: string
}

export interface ProtocolRelatedModality {
  id: string
  name: string
  fee: number
}

export interface ProtocolReviewReviewer {
  id: string
  username: string
  fullName: string
}

export interface ProtocolReview {
  id: string
  protocolId: string
  reviewer: ProtocolReviewReviewer
  committee: Committee
  outcome: ReviewOutcome
  observations: ProtocolReviewObservation[]
  createdAt: string
  updatedAt: string
}

export interface CreateProtocolReviewInput {
  committee: Committee
  outcome: ReviewOutcome
  observations?: { type: ObservationType; text: string }[]
  catalogadoRiesgo?: RiskLevel
}

/** Comentario con el que se corrigió un protocolo observado (historial). */
export interface ProtocolCorrection {
  id: string
  comment: string
  createdAt: string
}

export interface Protocol {
  id: string
  status: ProtocolStatus
  nroExpediente: string
  fechaRecepcion: string
  titulo: string
  lugarEjecucion: string
  esInstitucional: boolean
  investigadorPrincipal: ProtocolRelatedResearcher
  coinvestigadores: ProtocolRelatedResearcher[]
  asesores: ProtocolRelatedResearcher[]
  institucion: ProtocolRelatedEntity | null
  facultad: ProtocolRelatedEntity | null
  destinos: ProtocolRelatedEntity[]
  disenosEstudio: ProtocolRelatedEntity[]
  lineaHrl: ProtocolRelatedEntity
  lineaMeta2030: ProtocolRelatedEntity
  modalidad: ProtocolRelatedModality
  /** Dato histórico: ya no se pide al registrar. */
  propositoRevision: string | null
  fechaRevision: string | null
  tipoComprobante: string | null
  comprobanteRevision: string | null
  pagoRevision: number | null
  esEnmienda: boolean
  protocoloOriginalId: string | null
  protocoloOriginal: { id: string; nroExpediente: string } | null
  esConvenio: boolean
  convenioId: string | null
  convenio: ProtocolRelatedEntity | null
  requiereRevisionHc: boolean
  montoHc: number | null
  tipoComprobanteHc: string | null
  nroComprobanteHc: string | null
  certificadoBuenasPracticas: boolean
  tieneConstanciaEtica: boolean
  idConstanciaEtica: string | null
  fechaConstancia: string | null
  catalogadoRiesgo: RiskLevel | null
  consentimientoInformado: boolean
  departamentoDirigidoPermiso: string | null
  reviews?: ProtocolReview[]
  corrections: ProtocolCorrection[]
  createdAt: string
  updatedAt: string
}

export interface CreateProtocolInput {
  nroExpediente: string
  fechaRecepcion: string
  titulo: string
  lugarEjecucion: string
  esInstitucional?: boolean
  investigadorPrincipalId: string
  coinvestigadorIds?: string[]
  asesorIds?: string[]
  institucionId?: string
  facultadId?: string
  destinoIds?: string[]
  studyDesignIds?: string[]
  lineaHrlId: string
  lineaMeta2030Id: string
  modalidadId: string
  convenioId?: string
  pagoRevision?: number
  tipoComprobante?: string
  comprobanteRevision?: string
  protocoloOriginalId?: string
  requiereRevisionHc?: boolean
  montoHc?: number
  tipoComprobanteHc?: string
  nroComprobanteHc?: string
  tieneConstanciaEtica?: boolean
  idConstanciaEtica?: string
  fechaConstancia?: string
  consentimientoInformado?: boolean
  departamentoDirigidoPermiso?: string
  certificadoBuenasPracticas?: boolean
}

/**
 * Corrección parcial de un protocolo observado. `null` en el pago, los comprobantes o el departamento los
 * limpia en el backend; `undefined` los deja como estaban.
 */
export type UpdateProtocolInput = {
  /** Comentario de la corrección (historial); opcional. */
  correctionComment?: string
} & Partial<
  Omit<
    CreateProtocolInput,
    'protocoloOriginalId' | 'pagoRevision' | 'tipoComprobante' | 'comprobanteRevision' | 'departamentoDirigidoPermiso'
  >
> & {
  pagoRevision?: number | null
  tipoComprobante?: string | null
  comprobanteRevision?: string | null
  departamentoDirigidoPermiso?: string | null
}

export interface ProtocolListFilters {
  nroExpediente?: string
  investigadorPrincipalId?: string
  fechaRecepcionDesde?: string
  fechaRecepcionHasta?: string
  status?: ProtocolStatus
}

/** Versión resumida que devuelve `GET /protocols/mine` (solo lectura, rol investigador). */
export interface ProtocolSummary {
  id: string
  nroExpediente: string
  titulo: string
  fechaRecepcion: string
  status: ProtocolStatus
  investigadorPrincipal: ProtocolRelatedResearcher
  createdAt: string
  updatedAt: string
}

/** Dictamen tal como lo ve el investigador: sin revisor ni montos (`GET /protocols/mine/:id`). */
export interface ResearcherProtocolReview {
  id: string
  committee: Committee
  outcome: ReviewOutcome
  observations: ProtocolReviewObservation[]
  createdAt: string
}

/** Detalle de solo lectura de un protocolo propio (`GET /protocols/mine/:id`). */
export interface ResearcherProtocolDetail {
  id: string
  nroExpediente: string
  titulo: string
  fechaRecepcion: string
  status: ProtocolStatus
  investigadorPrincipal: ProtocolRelatedResearcher
  esEnmienda: boolean
  protocoloOriginal: { id: string; nroExpediente: string } | null
  reviews: ResearcherProtocolReview[]
  corrections: ProtocolCorrection[]
  createdAt: string
  updatedAt: string
}
