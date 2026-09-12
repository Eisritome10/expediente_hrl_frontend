import { z } from 'zod'

export const institutionFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingresa el nombre de la institución.')
    .max(150, 'Máximo 150 caracteres.'),
  abbreviation: z
    .union([z.literal(''), z.string().min(1).max(30, 'Máximo 30 caracteres.')])
    .optional(),
})

export type InstitutionFormValues = z.infer<typeof institutionFormSchema>
