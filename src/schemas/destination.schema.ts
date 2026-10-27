import { z } from 'zod'

export const destinationFormSchema = z.object({
  description: z
    .string()
    .min(1, 'Ingresa la descripción del destino.')
    .max(150, 'Máximo 150 caracteres.'),
  departmentHead: z.string().max(150, 'Máximo 150 caracteres.').optional().or(z.literal('')),
})

export type DestinationFormValues = z.infer<typeof destinationFormSchema>
