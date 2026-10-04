import { z } from 'zod'

export const studyDesignFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingresa el nombre del diseño de estudio.')
    .max(150, 'Máximo 150 caracteres.'),
})

export type StudyDesignFormValues = z.infer<typeof studyDesignFormSchema>
