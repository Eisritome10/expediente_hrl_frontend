import { z } from 'zod'

export const researcherFormSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos.'),
  firstName: z
    .string()
    .min(1, 'Ingresa los nombres.')
    .max(100, 'Máximo 100 caracteres.'),
  lastName: z
    .string()
    .min(1, 'Ingresa los apellidos.')
    .max(100, 'Máximo 100 caracteres.'),
  email: z.union([z.literal(''), z.string().email('Ingresa un correo válido.')]).optional(),
  phone: z.string().optional(),
})

export type ResearcherFormValues = z.infer<typeof researcherFormSchema>
