import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateFaculty, useUpdateFaculty } from '@/hooks/useFaculties'
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: faculty?.name ?? '',
    },
  })

  const onSubmit = async (values: FacultyFormValues) => {
    setFormError(null)
    try {
      if (isEditing && faculty) {
        await updateFaculty.mutateAsync({ id: faculty.id, payload: values })
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
      <FormField label="Nombre" htmlFor="name" error={errors.name?.message} required>
        <Input id="name" autoFocus placeholder="Medicina" error={errors.name?.message} {...register('name')} />
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
