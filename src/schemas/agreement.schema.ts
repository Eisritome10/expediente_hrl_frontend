import { z } from 'zod'

export const agreementFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa el nombre del convenio.')
    .max(150, 'Máximo 150 caracteres.'),
})

export type AgreementFormValues = z.infer<typeof agreementFormSchema>
