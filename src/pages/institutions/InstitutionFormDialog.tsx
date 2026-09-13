import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useCreateInstitution, useUpdateInstitution } from '@/hooks/useInstitutions'
import { institutionFormSchema, type InstitutionFormValues } from '@/schemas/institution.schema'
import { getInstitutionErrorMessage } from '@/pages/institutions/institution-error-messages'
import type { Institution } from '@/types/entities'

export function InstitutionFormDialog({
  open,
  onClose,
  institution,
}: {
  open: boolean
  onClose: () => void
  institution: Institution | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={institution ? 'Editar institución' : 'Nueva institución'}>
      {open && <InstitutionFormFields key={institution?.id ?? 'new'} institution={institution} onClose={onClose} />}
    </Dialog>
  )
}

function InstitutionFormFields({ institution, onClose }: { institution: Institution | null; onClose: () => void }) {
  const isEditing = Boolean(institution)
  const [formError, setFormError] = useState<string | null>(null)
  const createInstitution = useCreateInstitution()
  const updateInstitution = useUpdateInstitution()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: institution?.name ?? '',
      abbreviation: institution?.abbreviation ?? '',
      esUniversidad: institution?.esUniversidad ?? false,
    },
  })

  const esUniversidad = watch('esUniversidad')

  const onSubmit = async (values: InstitutionFormValues) => {
    setFormError(null)
    const payload = {
      name: values.name,
      abbreviation: values.abbreviation || undefined,
      esUniversidad: values.esUniversidad,
    }

    try {
      if (isEditing && institution) {
        await updateInstitution.mutateAsync({ id: institution.id, payload })
      } else {
        await createInstitution.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      setFormError(getInstitutionErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Nombre" htmlFor="name" error={errors.name?.message} required>
        <Input
          id="name"
          autoFocus
          placeholder="Hospital Rebagliati"
          error={errors.name?.message}
          {...register('name')}
        />
      </FormField>

      <FormField label="Abreviatura" htmlFor="abbreviation" error={errors.abbreviation?.message}>
        <Input id="abbreviation" placeholder="opcional" error={errors.abbreviation?.message} {...register('abbreviation')} />
      </FormField>

      <Switch
        checked={esUniversidad}
        onChange={(checked) => setValue('esUniversidad', checked)}
        label="Es universidad"
        description="Habilita asociar facultades a esta institución en los protocolos."
      />

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
