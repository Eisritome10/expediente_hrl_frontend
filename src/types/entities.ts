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
