import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { FormAlert } from '@/components/ui/FormAlert'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateFaculty, useUpdateFaculty } from '@/hooks/useFaculties'
import { useInstitutionsList } from '@/hooks/useInstitutions'
import { facultyFormSchema, type FacultyFormValues } from '@/schemas/faculty.schema'
import { getFacultyErrorMessage } from '@/pages/faculties/faculty-error-messages'
import type { Faculty } from '@/types/entities'

export function FacultyFormDialog({
  open,
  onClose,
  faculty,
}: {
  open: boolean
  onClose: () => void
  faculty: Faculty | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={faculty ? 'Editar facultad' : 'Nueva facultad'}>
      {open && <FacultyFormFields key={faculty?.id ?? 'new'} faculty={faculty} onClose={onClose} />}
    </Dialog>
  )
}

function FacultyFormFields({ faculty, onClose }: { faculty: Faculty | null; onClose: () => void }) {
  const isEditing = Boolean(faculty)
  const [formError, setFormError] = useState<string | null>(null)
  const createFaculty = useCreateFaculty()
  const updateFaculty = useUpdateFaculty()
  const institutions = useInstitutionsList({ page: 1, limit: 100 })

  // Solo las universidades tienen facultades.
  const universityOptions: ComboboxOption[] = useMemo(
    () =>
      (institutions.data?.data ?? [])
        .filter((institution) => institution.type === 'UNIVERSITY')
        .map((institution) => ({ id: institution.id, label: institution.name })),
    [institutions.data],
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: faculty?.name ?? '',
      institutionId: faculty?.institutionId ?? '',
    },
  })

  const onSubmit = async (values: FacultyFormValues) => {
    setFormError(null)
    try {
      if (isEditing && faculty) {
        // La universidad de una facultad no cambia: solo se puede renombrar.
        await updateFaculty.mutateAsync({ id: faculty.id, payload: { name: values.name } })
      } else {
        await createFaculty.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      setFormError(getFacultyErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Universidad" htmlFor="institutionId" error={errors.institutionId?.message} required>
        {isEditing ? (
          <Input id="institutionId" readOnly value={faculty?.institutionName ?? 'Sin universidad (facultad histórica)'} />
        ) : (
          <Controller
            name="institutionId"
            control={control}
            render={({ field }) => (
              <Combobox
                options={universityOptions}
                value={field.value}
                onChange={field.onChange}
                loading={institutions.isPending}
                error={errors.institutionId?.message}
                placeholder="Selecciona la universidad"
                label="universidad"
              />
            )}
          />
        )}
      </FormField>

      <FormField label="Nombre" htmlFor="name" error={errors.name?.message} required>
        <Input id="name" autoFocus placeholder="Medicina" error={errors.name?.message} {...register('name')} />
      </FormField>

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
