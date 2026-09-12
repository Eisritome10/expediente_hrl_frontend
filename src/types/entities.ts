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
  createdAt: string
  updatedAt: string
}

export interface CreateInstitutionInput {
  name: string
  abbreviation?: string
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
