import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { FormField, Input, Select, Textarea } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useUpdateProtocol } from '@/hooks/useProtocols'
import { comprobanteError } from '@/lib/comprobante'
import { ObservationList } from '@/pages/protocols/ObservationList'
import { getProtocolErrorMessage } from '@/pages/protocols/protocol-error-messages'
import { COMMITTEE_NAMES } from '@/pages/protocols/protocol-review-labels'
import type { Committee, Protocol, ProtocolReviewObservation, UpdateProtocolInput } from '@/types/entities'

interface CorrectFormValues {
  titulo: string
  lugarEjecucion: string
  tipoComprobante: string
  comprobanteRevision: string
  certificadoBuenasPracticas: boolean
  correctionComment: string
}

/** Dictamen observado que se está corrigiendo (solo se necesita el comité y la lista de observaciones). */
interface ObservedReview {
  committee: Committee
  observations: ProtocolReviewObservation[]
}

export function ProtocolCorrectDialog({
  open,
  onClose,
  protocol,
  observation,
}: {
  open: boolean
  onClose: () => void
  protocol: Protocol
  /** Último dictamen OBSERVED: se muestra aquí para corregir sin salir del formulario. */
  observation: ObservedReview | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Corregir observación" className="max-w-xl">
      {open && <CorrectForm protocol={protocol} observation={observation} onClose={onClose} />}
    </Dialog>
  )
}

function CorrectForm({
  protocol,
  observation,
  onClose,
}: {
  protocol: Protocol
  observation: ObservedReview | null
  onClose: () => void
}) {
  const updateProtocol = useUpdateProtocol()
  const [formError, setFormError] = useState<string | null>(null)
  // Muchas correcciones son cambios internos que no están dentro del sistema: por defecto solo se muestran las
  // observaciones y el comentario; los campos corregibles se abren a pedido.
  const [showFields, setShowFields] = useState(false)

  const exonerado = protocol.esEnmienda || Boolean(protocol.convenio)

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CorrectFormValues>({
    defaultValues: {
      titulo: protocol.titulo,
      lugarEjecucion: protocol.lugarEjecucion,
      tipoComprobante: protocol.tipoComprobante ?? '',
      comprobanteRevision: protocol.comprobanteRevision ?? '',
      certificadoBuenasPracticas: protocol.certificadoBuenasPracticas,
      correctionComment: '',
    },
  })

  const onSubmit = async (values: CorrectFormValues) => {
    setFormError(null)

    if (showFields && !exonerado) {
      const tipo = values.tipoComprobante.trim()
      const numero = values.comprobanteRevision.trim()
      if (tipo || numero) {
        let invalid = false
        if (!tipo) {
          setError('tipoComprobante', { type: 'validate', message: 'Selecciona boleta o factura.' })
          invalid = true
        }
        if (!numero) {
          setError('comprobanteRevision', { type: 'validate', message: 'Ingresa el N° de comprobante.' })
          invalid = true
        } else if (tipo) {
          const message = comprobanteError(tipo, numero)
          if (message) {
            setError('comprobanteRevision', { type: 'validate', message })
            invalid = true
          }
        }
        if (invalid) return
      }
    }

    const payload: UpdateProtocolInput = {
      correctionComment: values.correctionComment.trim() || undefined,
      ...(showFields
        ? {
            titulo: values.titulo.trim(),
            lugarEjecucion: values.lugarEjecucion.trim(),
            ...(exonerado
              ? {}
              : {
                  // El monto lo fija la modalidad del protocolo: no se edita.
                  pagoRevision: protocol.modalidad.fee,
                  tipoComprobante: values.tipoComprobante.trim() || null,
                  comprobanteRevision: values.comprobanteRevision.trim().toUpperCase() || null,
                }),
            ...(protocol.requiereRevisionHc ? { certificadoBuenasPracticas: values.certificadoBuenasPracticas } : {}),
          }
        : {}),
    }

    try {
      await updateProtocol.mutateAsync({ id: protocol.id, payload })
      onClose()
    } catch (error) {
      setFormError(getProtocolErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {observation && observation.observations.length > 0 && (
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-900">
            Observaciones del {COMMITTEE_NAMES[observation.committee]}
          </p>
          <ObservationList observations={observation.observations} />
        </div>
      )}

      <div className="flex flex-col items-start gap-2">
        <Button type="button" variant="secondary" aria-expanded={showFields} onClick={() => setShowFields((current) => !current)}>
          {showFields ? 'Ocultar campos corregibles' : 'Mostrar campos corregibles'}
        </Button>
        {!showFields && (
          <p className="text-xs text-text-muted">
            Si la corrección se hizo fuera del sistema, no hace falta tocar ningún campo: deja un comentario y envía.
          </p>
        )}
      </div>

      {showFields && (
        <>
          <FormField label="Título del proyecto" htmlFor="titulo" error={errors.titulo?.message} required>
            <Textarea id="titulo" rows={3} {...register('titulo', { required: 'Ingresa el título.' })} />
          </FormField>

          <FormField label="Lugar de ejecución" htmlFor="lugarEjecucion" error={errors.lugarEjecucion?.message} required>
            <Input id="lugarEjecucion" {...register('lugarEjecucion', { required: 'Ingresa el lugar de ejecución.' })} />
          </FormField>

          {!exonerado && (
            <fieldset className="flex flex-col gap-4 rounded-lg border border-border bg-surface-muted/60 p-4">
              <legend className="px-1 text-sm font-semibold text-text">Pago de revisión</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Pago (S/)" htmlFor="pagoRevision" hint="Lo establece la modalidad; no se edita.">
                  <Input id="pagoRevision" readOnly tabIndex={-1} value={protocol.modalidad.fee.toFixed(2)} />
                </FormField>
                <FormField label="Tipo de comprobante" htmlFor="tipoComprobante" error={errors.tipoComprobante?.message}>
                  <Select id="tipoComprobante" {...register('tipoComprobante')}>
                    <option value="">Selecciona...</option>
                    <option value="BOLETA">Boleta</option>
                    <option value="FACTURA">Factura</option>
                  </Select>
                </FormField>
                <FormField label="N° de comprobante" htmlFor="comprobanteRevision" error={errors.comprobanteRevision?.message}>
                  <Input
                    id="comprobanteRevision"
                    placeholder="B001-00001234"
                    className="uppercase"
                    {...register('comprobanteRevision')}
                  />
                </FormField>
              </div>
            </fieldset>
          )}

          {protocol.requiereRevisionHc && (
            <Controller
              name="certificadoBuenasPracticas"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Cuenta con certificado de buenas prácticas"
                  description="Se pide porque el protocolo requiere revisión de historia clínica."
                />
              )}
            />
          )}
        </>
      )}

      <FormField
        label="Comentario de la corrección (opcional)"
        htmlFor="correctionComment"
        hint="Describe lo que se corrigió, sobre todo si el cambio se hizo fuera del sistema o no se puede hacer aquí."
        error={errors.correctionComment?.message}
      >
        <Textarea id="correctionComment" rows={3} maxLength={2000} {...register('correctionComment')} />
      </FormField>

      <p className="text-sm text-text-muted">
        Al enviar, el protocolo pasa a estado <strong className="font-semibold text-text">Corregido</strong> y el comité
        podrá volver a evaluarlo.
      </p>

      {formError && <FormAlert>{formError}</FormAlert>}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Enviar corrección
        </Button>
      </div>
    </form>
  )
}
