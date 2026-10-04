import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateDestination, useUpdateDestination } from '@/hooks/useDestinations'
import { destinationFormSchema, type DestinationFormValues } from '@/schemas/destination.schema'
import { getDestinationErrorMessage } from '@/pages/destinations/destination-error-messages'
import type { Destination } from '@/types/entities'
import { FormAlert } from '@/components/ui/FormAlert'

export function DestinationFormDialog({
  open,
  onClose,
  destination,
}: {
  open: boolean
  onClose: () => void
  destination: Destination | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={destination ? 'Editar destino' : 'Nuevo destino'}>
      {open && <DestinationFormFields key={destination?.id ?? 'new'} destination={destination} onClose={onClose} />}
    </Dialog>
  )
}

function DestinationFormFields({ destination, onClose }: { destination: Destination | null; onClose: () => void }) {
  const isEditing = Boolean(destination)
  const [formError, setFormError] = useState<string | null>(null)
  const createDestination = useCreateDestination()
  const updateDestination = useUpdateDestination()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      description: destination?.description ?? '',
    },
  })

  const onSubmit = async (values: DestinationFormValues) => {
    setFormError(null)
    try {
      if (isEditing && destination) {
        await updateDestination.mutateAsync({ id: destination.id, payload: values })
      } else {
        await createDestination.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      setFormError(getDestinationErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Descripción" htmlFor="description" error={errors.description?.message} required>
        <Input
          id="description"
          autoFocus
          placeholder="Comité de Ética"
          error={errors.description?.message}
          {...register('description')}
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
