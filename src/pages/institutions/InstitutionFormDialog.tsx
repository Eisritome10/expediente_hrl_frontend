import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createInstitutionFaculty } from '@/api/institutions'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input, FormField } from '@/components/ui/Input'
import { RadioCardGroup, type RadioCardOption } from '@/components/ui/RadioCardGroup'
import { useCreateInstitution, useUpdateInstitution } from '@/hooks/useInstitutions'
import { institutionFormSchema, type InstitutionFormValues } from '@/schemas/institution.schema'
import { getInstitutionErrorMessage } from '@/pages/institutions/institution-error-messages'
import { INSTITUTION_TYPES, INSTITUTION_TYPE_DESCRIPTIONS, INSTITUTION_TYPE_LABELS } from '@/pages/institutions/institution-types'
import { UniversityFacultiesEditor } from '@/pages/institutions/UniversityFacultiesEditor'
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
    <Dialog
      open={open}
      onClose={onClose}
      title={institution ? 'Editar institución' : 'Nueva institución'}
      className="max-w-lg"
    >
      {open && <InstitutionFormFields key={institution?.id ?? 'new'} institution={institution} onClose={onClose} />}
    </Dialog>
  )
}

const typeOptions: RadioCardOption<InstitutionFormValues['type']>[] = INSTITUTION_TYPES.map((type) => ({
  value: type,
  label: INSTITUTION_TYPE_LABELS[type],
  description: INSTITUTION_TYPE_DESCRIPTIONS[type],
}))

function InstitutionFormFields({ institution, onClose }: { institution: Institution | null; onClose: () => void }) {
  const isEditing = Boolean(institution)
  const [formError, setFormError] = useState<string | null>(null)
  // Facultades de una universidad nueva: se guardan, cada una por su cuenta, después de crear la institución.
  const [facultyDrafts, setFacultyDrafts] = useState<string[]>([])
  const queryClient = useQueryClient()
  const createInstitution = useCreateInstitution()
  const updateInstitution = useUpdateInstitution()

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: institution?.name ?? '',
      abbreviation: institution?.abbreviation ?? '',
      type: institution?.type ?? 'HOSPITAL',
    },
  })

  const type = watch('type')
  const isUniversity = type === 'UNIVERSITY'

  const saveFacultyDrafts = async (institutionId: string) => {
    const failed: string[] = []
    for (const name of facultyDrafts) {
      try {
        await createInstitutionFaculty(institutionId, { name })
      } catch {
        failed.push(name)
      }
    }
    await queryClient.invalidateQueries({ queryKey: ['institutions', 'faculties'] })
    if (failed.length > 0) {
      toast.error(`La institución se guardó, pero no se pudieron guardar estas facultades: ${failed.join(', ')}.`)
    }
  }

  const onSubmit = async (values: InstitutionFormValues) => {
    setFormError(null)
    const payload = {
      name: values.name,
      abbreviation: values.abbreviation || undefined,
      type: values.type,
    }

    try {
      if (isEditing && institution) {
        await updateInstitution.mutateAsync({ id: institution.id, payload })
      } else {
        const created = await createInstitution.mutateAsync(payload)
        if (values.type === 'UNIVERSITY' && facultyDrafts.length > 0) await saveFacultyDrafts(created.id)
      }
      onClose()
    } catch (error) {
      setFormError(getInstitutionErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <RadioCardGroup legend="Tipo de institución" value={field.value} onChange={field.onChange} options={typeOptions} />
        )}
      />

      {isUniversity && (
        <UniversityFacultiesEditor
          institutionId={institution?.type === 'UNIVERSITY' ? institution.id : null}
          drafts={facultyDrafts}
          onDraftsChange={setFacultyDrafts}
        />
      )}

      {formError && <FormAlert>{formError}</FormAlert>}

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
