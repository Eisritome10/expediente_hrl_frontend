import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateModality, useUpdateModality } from '@/hooks/useModalities'
import { modalityFormSchema, type ModalityFormValues } from '@/schemas/modality.schema'
import { getModalityErrorMessage } from '@/pages/modalities/modality-error-messages'
import type { Modality } from '@/types/entities'

export function ModalityFormDialog({
  open,
  onClose,
  modality,
}: {
  open: boolean
  onClose: () => void
  modality: Modality | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={modality ? 'Editar modalidad' : 'Nueva modalidad'}>
      {open && <ModalityFormFields key={modality?.id ?? 'new'} modality={modality} onClose={onClose} />}
    </Dialog>
  )
}

function ModalityFormFields({ modality, onClose }: { modality: Modality | null; onClose: () => void }) {
  const isEditing = Boolean(modality)
  const [formError, setFormError] = useState<string | null>(null)
  const createModality = useCreateModality()
  const updateModality = useUpdateModality()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ModalityFormValues>({
    resolver: zodResolver(modalityFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: modality?.name ?? '',
      fee: modality?.fee ?? 0,
    },
  })

  const onSubmit = async (values: ModalityFormValues) => {
    setFormError(null)
    try {
      if (isEditing && modality) {
        await updateModality.mutateAsync({ id: modality.id, payload: values })
      } else {
        await createModality.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      setFormError(getModalityErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Nombre" htmlFor="name" error={errors.name?.message} required>
        <Input
          id="name"
          autoFocus
          placeholder="Investigación con financiamiento"
          error={errors.name?.message}
          {...register('name')}
        />
      </FormField>

      <FormField label="Costo" htmlFor="fee" error={errors.fee?.message} required>
        <Input
          id="fee"
          type="number"
          step="0.01"
          min="0"
          placeholder="150.50"
          error={errors.fee?.message}
          {...register('fee', { valueAsNumber: true })}
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
