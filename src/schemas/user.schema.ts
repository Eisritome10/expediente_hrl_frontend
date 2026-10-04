import { z } from 'zod'

const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])

export const userCreateFormSchema = z.object({
  username: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres.')
    .max(50, 'Máximo 50 caracteres.'),
  fullName: z
    .string()
    .min(1, 'Ingresa el nombre completo.')
    .max(150, 'Máximo 150 caracteres.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  status: userStatusSchema,
})

export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>

export const userEditFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Ingresa el nombre completo.')
    .max(150, 'Máximo 150 caracteres.'),
  status: userStatusSchema,
})

export type UserEditFormValues = z.infer<typeof userEditFormSchema>
