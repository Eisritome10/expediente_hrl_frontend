import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { useCreateResearchLine, useUpdateResearchLine } from '@/hooks/useResearchLines'
import { researchLineFormSchema, type ResearchLineFormValues } from '@/schemas/research-line.schema'
import { getResearchLineErrorMessage } from '@/pages/research-lines/research-line-error-messages'
import type { ResearchLine } from '@/types/entities'
import { FormAlert } from '@/components/ui/FormAlert'

const typeOptions: ComboboxOption[] = [
  { id: 'HRL', label: 'HRL' },
  { id: 'META_2030', label: 'Meta 2030' },
]

export function ResearchLineFormDialog({
  open,
  onClose,
  researchLine,
}: {
  open: boolean
  onClose: () => void
  researchLine: ResearchLine | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={researchLine ? 'Editar línea de investigación' : 'Nueva línea de investigación'}>
      {open && (
        <ResearchLineFormFields key={researchLine?.id ?? 'new'} researchLine={researchLine} onClose={onClose} />
      )}
    </Dialog>
  )
}

function ResearchLineFormFields({
  researchLine,
  onClose,
}: {
  researchLine: ResearchLine | null
  onClose: () => void
}) {
  const isEditing = Boolean(researchLine)
  const [formError, setFormError] = useState<string | null>(null)
  const createResearchLine = useCreateResearchLine()
  const updateResearchLine = useUpdateResearchLine()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResearchLineFormValues>({
    resolver: zodResolver(researchLineFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: researchLine?.name ?? '',
      type: researchLine?.type ?? 'HRL',
    },
  })

  const onSubmit = async (values: ResearchLineFormValues) => {
    setFormError(null)
    const payload = { name: values.name.trim(), type: values.type }

    try {
      if (isEditing && researchLine) {
        await updateResearchLine.mutateAsync({ id: researchLine.id, payload })
      } else {
        await createResearchLine.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      setFormError(getResearchLineErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Nombre" htmlFor="name" error={errors.name?.message} required>
        <Input
          id="name"
          autoFocus
          placeholder="Inteligencia Artificial"
          error={errors.name?.message}
          {...register('name')}
        />
      </FormField>

      <FormField label="Tipo" htmlFor="type" error={errors.type?.message} required>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Combobox
              options={typeOptions}
              value={field.value}
              onChange={field.onChange}
              label="tipo de línea"
              error={errors.type?.message}
            />
          )}
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
