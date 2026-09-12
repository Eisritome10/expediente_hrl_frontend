import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateResearcher, useUpdateResearcher } from '@/hooks/useResearchers'
import { researcherFormSchema, type ResearcherFormValues } from '@/schemas/researcher.schema'
import { getResearcherErrorMessage } from '@/pages/researchers/researcher-error-messages'
import type { Researcher } from '@/types/entities'

export function ResearcherFormDialog({
  open,
  onClose,
  researcher,
}: {
  open: boolean
  onClose: () => void
  researcher: Researcher | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={researcher ? 'Editar investigador' : 'Nuevo investigador'}>
      {open && <ResearcherFormFields key={researcher?.id ?? 'new'} researcher={researcher} onClose={onClose} />}
    </Dialog>
  )
}

function ResearcherFormFields({ researcher, onClose }: { researcher: Researcher | null; onClose: () => void }) {
  const isEditing = Boolean(researcher)
  const [formError, setFormError] = useState<string | null>(null)
  const createResearcher = useCreateResearcher()
  const updateResearcher = useUpdateResearcher()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      dni: researcher?.dni ?? '',
      firstName: researcher?.firstName ?? '',
      lastName: researcher?.lastName ?? '',
      email: researcher?.email ?? '',
      phone: researcher?.phone ?? '',
    },
  })

  const onSubmit = async (values: ResearcherFormValues) => {
    setFormError(null)
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || undefined,
      phone: values.phone || undefined,
    }

    try {
      if (isEditing && researcher) {
        await updateResearcher.mutateAsync({ id: researcher.id, payload })
      } else {
        await createResearcher.mutateAsync({ ...payload, dni: values.dni })
      }
      onClose()
    } catch (error) {
      setFormError(getResearcherErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="DNI" htmlFor="dni" error={errors.dni?.message} required>
        <Input
          id="dni"
          maxLength={8}
          disabled={isEditing}
          placeholder="12345678"
          error={errors.dni?.message}
          {...register('dni')}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombres" htmlFor="firstName" error={errors.firstName?.message} required>
          <Input id="firstName" autoFocus error={errors.firstName?.message} {...register('firstName')} />
        </FormField>
        <FormField label="Apellidos" htmlFor="lastName" error={errors.lastName?.message} required>
          <Input id="lastName" error={errors.lastName?.message} {...register('lastName')} />
        </FormField>
      </div>

      <FormField label="Correo electrónico" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" placeholder="opcional" error={errors.email?.message} {...register('email')} />
      </FormField>

      <FormField label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
        <Input
          id="phone"
          maxLength={9}
          placeholder="9 dígitos (opcional)"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </FormField>

      {formError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          {formError}
        </div>
      )}

      <div className="mt-1 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
