import { z } from 'zod'

export const facultyFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingresa el nombre de la facultad.')
    .max(150, 'Máximo 150 caracteres.'),
})

export type FacultyFormValues = z.infer<typeof facultyFormSchema>
