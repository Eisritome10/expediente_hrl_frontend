import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateStudyDesign, useUpdateStudyDesign } from '@/hooks/useStudyDesigns'
import { studyDesignFormSchema, type StudyDesignFormValues } from '@/schemas/study-design.schema'
import { getStudyDesignErrorMessage } from '@/pages/study-designs/study-design-error-messages'
import type { StudyDesign } from '@/types/entities'
import { FormAlert } from '@/components/ui/FormAlert'

export function StudyDesignFormDialog({
  open,
  onClose,
  studyDesign,
}: {
  open: boolean
  onClose: () => void
  studyDesign: StudyDesign | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={studyDesign ? 'Editar diseño de estudio' : 'Nuevo diseño de estudio'}>
      {open && <StudyDesignFormFields key={studyDesign?.id ?? 'new'} studyDesign={studyDesign} onClose={onClose} />}
    </Dialog>
  )
}

function StudyDesignFormFields({ studyDesign, onClose }: { studyDesign: StudyDesign | null; onClose: () => void }) {
  const isEditing = Boolean(studyDesign)
  const [formError, setFormError] = useState<string | null>(null)
  const createStudyDesign = useCreateStudyDesign()
  const updateStudyDesign = useUpdateStudyDesign()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudyDesignFormValues>({
    resolver: zodResolver(studyDesignFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: studyDesign?.name ?? '',
    },
  })

  const onSubmit = async (values: StudyDesignFormValues) => {
    setFormError(null)
    try {
      if (isEditing && studyDesign) {
        await updateStudyDesign.mutateAsync({ id: studyDesign.id, payload: values })
      } else {
        await createStudyDesign.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      setFormError(getStudyDesignErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Nombre" htmlFor="name" error={errors.name?.message} required>
        <Input
          id="name"
          autoFocus
          placeholder="Descriptivo transversal"
          error={errors.name?.message}
          {...register('name')}
        />
      </FormField>

      {formError && (
        <FormAlert>{formError}</FormAlert>
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
