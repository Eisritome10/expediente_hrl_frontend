import { z } from 'zod'

export const modalityFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingresa el nombre de la modalidad.')
    .max(150, 'Máximo 150 caracteres.'),
  fee: z
    .number({ message: 'Ingresa el costo de la modalidad.' })
    .min(0, 'El costo no puede ser negativo.'),
})

export type ModalityFormValues = z.infer<typeof modalityFormSchema>
