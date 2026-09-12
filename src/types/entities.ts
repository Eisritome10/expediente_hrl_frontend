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

export interface Institution {
  id: string
  name: string
  abbreviation: string | null
  createdAt: string
  updatedAt: string
}
