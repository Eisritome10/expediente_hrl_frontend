import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircleIcon, InfoIcon } from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { useCreateResearcher, useReniecLookup, useUpdateResearcher } from '@/hooks/useResearchers'
import { researcherFormSchema, type ResearcherFormValues } from '@/schemas/researcher.schema'
import {
  getReniecLookupMessage,
  getResearcherErrorMessage,
  isDuplicateResearcherError,
} from '@/pages/researchers/researcher-error-messages'
import type { Researcher } from '@/types/entities'
import { FormAlert } from '@/components/ui/FormAlert'

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
    setValue,
    watch,
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

  // Al crear, el DNI se valida en RENIEC y de ahí salen nombres y apellidos. Si RENIEC no responde o no lo
  // encuentra, los campos se habilitan para escribirlos a mano (correo y teléfono siempre son manuales).
  const dni = watch('dni')
  const lookup = useReniecLookup(dni, !isEditing)
  // En edición la consulta está deshabilitada, pero React Query puede traer resultados en caché de un alta anterior.
  const lookupError = !isEditing && lookup.isError ? lookup.error : null
  const lookupData = isEditing ? undefined : lookup.data
  const isDuplicate = lookupError !== null && isDuplicateResearcherError(lookupError)
  const isManualFallback = lookupError !== null && !isDuplicate
  const isLookingUp = !isEditing && lookup.isFetching
  const namesLocked = !isEditing && !isManualFallback

  useEffect(() => {
    if (isEditing) return
    setValue('firstName', '')
    setValue('lastName', '')
  }, [dni, isEditing, setValue])

  useEffect(() => {
    if (!lookupData) return
    setValue('firstName', lookupData.firstName, { shouldValidate: true })
    setValue('lastName', lookupData.lastName, { shouldValidate: true })
  }, [lookupData, setValue])

  const dniHint = isEditing
    ? undefined
    : isLookingUp
      ? 'Consultando RENIEC…'
      : lookupData || lookupError
        ? undefined
        : 'Al ingresar el DNI se completan los nombres y apellidos desde RENIEC.'
  const dniMessage = lookupError && !isLookingUp ? getReniecLookupMessage(lookupError) : undefined

  const onSubmit = async (values: ResearcherFormValues) => {
    setFormError(null)
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || undefined,
    }

    try {
      if (isEditing && researcher) {
        // En edición, vaciar el teléfono lo borra en el backend (`null`); `undefined` lo dejaría como estaba.
        await updateResearcher.mutateAsync({
          id: researcher.id,
          payload: { ...payload, phone: values.phone || null },
        })
      } else {
        await createResearcher.mutateAsync({ ...payload, phone: values.phone || undefined, dni: values.dni })
      }
      onClose()
    } catch (error) {
      setFormError(getResearcherErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {!isEditing && (
        <div className="flex items-start gap-2 rounded-lg bg-brand-50 px-3.5 py-2.5 text-sm text-brand-700">
          <InfoIcon size={18} className="shrink-0" />
          <span>Se creará una cuenta de acceso: el usuario y la contraseña inicial serán el DNI del investigador.</span>
        </div>
      )}

      <FormField
        label="DNI"
        htmlFor="dni"
        hint={dniHint}
        error={errors.dni?.message ?? (isDuplicate ? dniMessage : undefined)}
        required
      >
        <Input
          id="dni"
          maxLength={8}
          inputMode="numeric"
          autoFocus={!isEditing}
          disabled={isEditing}
          placeholder="12345678"
          error={errors.dni?.message ?? (isDuplicate ? dniMessage : undefined)}
          {...register('dni')}
        />
      </FormField>

      {lookupData && (
        <p className="-mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-700">
          <CheckCircleIcon size={16} weight="fill" aria-hidden />
          Datos obtenidos de RENIEC. Completa el correo y el teléfono si los tienes.
        </p>
      )}
      {isManualFallback && dniMessage && !isLookingUp && (
        <p role="status" className="-mt-2 flex items-start gap-1.5 text-xs text-amber-700">
          <InfoIcon size={16} className="mt-px shrink-0" aria-hidden />
          {dniMessage}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombres" htmlFor="firstName" error={errors.firstName?.message} required>
          <Input
            id="firstName"
            readOnly={namesLocked}
            placeholder={namesLocked ? 'Se completa con el DNI' : undefined}
            className={namesLocked ? 'bg-wash' : undefined}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </FormField>
        <FormField label="Apellidos" htmlFor="lastName" error={errors.lastName?.message} required>
          <Input
            id="lastName"
            readOnly={namesLocked}
            placeholder={namesLocked ? 'Se completa con el DNI' : undefined}
            className={namesLocked ? 'bg-wash' : undefined}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
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
        <FormAlert>{formError}</FormAlert>
      )}

      <div className="mt-1 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isDuplicate}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
