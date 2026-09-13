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

export interface Institution {
  id: string
  name: string
  abbreviation: string | null
  esUniversidad: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateInstitutionInput {
  name: string
  abbreviation?: string
  esUniversidad?: boolean
}

export type UpdateInstitutionInput = Partial<CreateInstitutionInput>

export interface Faculty {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateFacultyInput {
  name: string
}

export type UpdateFacultyInput = Partial<CreateFacultyInput>

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

export type LineType = 'HRL' | 'META_2030'

export interface ResearchLine {
  id: string
  name: string
  type: LineType
  createdAt: string
  updatedAt: string
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

export interface Protocol {
  id: string
  nroExpediente: string
  fechaRecepcion: string
  titulo: string
  disenoEstudio: string
  lugarEjecucion: string
  esInstitucional: boolean
  investigadorPrincipal: ProtocolRelatedResearcher
  coinvestigadores: ProtocolRelatedResearcher[]
  asesores: ProtocolRelatedResearcher[]
  institucion: ProtocolRelatedEntity | null
  facultad: ProtocolRelatedEntity | null
  destinos: ProtocolRelatedEntity[]
  lineaHrl: ProtocolRelatedEntity
  lineaMeta2030: ProtocolRelatedEntity
  modalidad: ProtocolRelatedModality
  propositoRevision: string
  fechaRevision: string | null
  tipoComprobante: string | null
  comprobanteRevision: string | null
  pagoRevision: number | null
  esEnmienda: boolean
  esConvenio: boolean
  nombreConvenio: string | null
  requiereRevisionHc: boolean
  montoHc: number | null
  tipoComprobanteHc: string | null
  nroComprobanteHc: string | null
  certificadoBuenasPracticas: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProtocolInput {
  nroExpediente: string
  fechaRecepcion: string
  titulo: string
  disenoEstudio: string
  lugarEjecucion: string
  esInstitucional?: boolean
  investigadorPrincipalId: string
  coinvestigadorIds?: string[]
  asesorIds?: string[]
  institucionId?: string
  facultadId?: string
  destinoIds?: string[]
  lineaHrlId: string
  lineaMeta2030Id: string
  modalidadId: string
  propositoRevision: string
  fechaRevision?: string
  tipoComprobante?: string
  comprobanteRevision?: string
  pagoRevision?: number
  esEnmienda?: boolean
  esConvenio?: boolean
  nombreConvenio?: string
  requiereRevisionHc?: boolean
  montoHc?: number
  tipoComprobanteHc?: string
  nroComprobanteHc?: string
  certificadoBuenasPracticas?: boolean
}

export interface ProtocolListFilters {
  nroExpediente?: string
  investigadorPrincipalId?: string
  fechaRecepcionDesde?: string
  fechaRecepcionHasta?: string
}
