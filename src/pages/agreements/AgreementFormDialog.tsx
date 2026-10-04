import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateAgreement, useUpdateAgreement } from '@/hooks/useAgreements'
import { agreementFormSchema, type AgreementFormValues } from '@/schemas/agreement.schema'
import { getAgreementErrorMessage } from '@/pages/agreements/agreement-error-messages'
import type { Agreement } from '@/types/entities'
import { FormAlert } from '@/components/ui/FormAlert'

export function AgreementFormDialog({
  open,
  onClose,
  agreement,
}: {
  open: boolean
  onClose: () => void
  agreement: Agreement | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={agreement ? 'Editar convenio' : 'Nuevo convenio'}>
      {open && <AgreementFormFields key={agreement?.id ?? 'new'} agreement={agreement} onClose={onClose} />}
    </Dialog>
  )
}

function AgreementFormFields({ agreement, onClose }: { agreement: Agreement | null; onClose: () => void }) {
  const isEditing = Boolean(agreement)
  const [formError, setFormError] = useState<string | null>(null)
  const createAgreement = useCreateAgreement()
  const updateAgreement = useUpdateAgreement()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: agreement?.name ?? '',
    },
  })

  const onSubmit = async (values: AgreementFormValues) => {
    setFormError(null)
    try {
      if (isEditing && agreement) {
        await updateAgreement.mutateAsync({ id: agreement.id, payload: values })
      } else {
        await createAgreement.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      setFormError(getAgreementErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Nombre del convenio" htmlFor="name" error={errors.name?.message} required>
        <Input
          id="name"
          autoFocus
          placeholder="Convenio Marco Instituto Nacional de Salud - HRL"
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
