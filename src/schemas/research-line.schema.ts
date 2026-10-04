import { z } from 'zod'

export const researchLineFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingresa el nombre de la línea de investigación.')
    .max(200, 'Máximo 200 caracteres.'),
  type: z.enum(['HRL', 'META_2030']),
})

export type ResearchLineFormValues = z.infer<typeof researchLineFormSchema>
