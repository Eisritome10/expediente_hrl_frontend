import { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { FormField, Select, Textarea } from '@/components/ui/Input'
import { RadioCardGroup, type RadioCardOption } from '@/components/ui/RadioCardGroup'
import { useCreateProtocolReview } from '@/hooks/useProtocolReviews'
import { getProtocolErrorMessage } from '@/pages/protocols/protocol-error-messages'
import { COMMITTEE_NAMES, OBSERVATION_TYPES, OBSERVATION_TYPE_LABELS } from '@/pages/protocols/protocol-review-labels'
import type {
  Committee,
  CreateProtocolReviewInput,
  ObservationType,
  Protocol,
  ReviewOutcome,
  RiskLevel,
} from '@/types/entities'

interface ObservationRow {
  type: ObservationType | ''
  text: string
}

interface ReviewFormValues {
  outcome: ReviewOutcome
  observations: ObservationRow[]
  catalogadoRiesgo: RiskLevel | ''
}

// Al observar siempre hay una observación lista; el tipo por defecto es "Otro" y se puede cambiar.
const EMPTY_ROW: ObservationRow = { type: 'OTHER', text: '' }

const SUBMIT_LABEL: Record<ReviewOutcome, string> = {
  OBSERVED: 'Registrar observaciones',
  APPROVED: 'Aprobar protocolo',
  FINALIZED: 'Finalizar protocolo',
}

export function ProtocolReviewDialog({
  open,
  onClose,
  protocol,
  cicClosed,
}: {
  open: boolean
  onClose: () => void
  protocol: Protocol
  cicClosed: boolean
}) {
  // El comité se deriva del estado del protocolo (solo lectura): si el CIC ya cerró,
  // el dictamen corresponde al CIEI; de lo contrario, al CIC.
  const committee: Committee = cicClosed ? 'CIEI' : 'CIC'

  return (
    <Dialog open={open} onClose={onClose} title="Registrar dictamen" className="max-w-xl">
      {open && <ReviewForm protocol={protocol} committee={committee} onClose={onClose} />}
    </Dialog>
  )
}

function ReviewForm({
  protocol,
  committee,
  onClose,
}: {
  protocol: Protocol
  committee: Committee
  onClose: () => void
}) {
  const createReview = useCreateProtocolReview(protocol.id)
  const [formError, setFormError] = useState<string | null>(null)
  const isCiei = committee === 'CIEI'

  // El certificado de buenas prácticas se registró al crear el protocolo (solo aplica con revisión de HC).
  // El CIEI lo evalúa, pero su falta no impide finalizar.
  const certificateMissing = protocol.requiereRevisionHc && !protocol.certificadoBuenasPracticas

  // El CIEI no puede finalizar con una observación pendiente de corregir.
  const canFinalize = isCiei && protocol.status !== 'CIEI_OBSERVED'
  const finalizeBlockedReason = 'Disponible cuando el CIEI no tenga observaciones pendientes de corregir.'

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    defaultValues: { outcome: 'OBSERVED', observations: [EMPTY_ROW], catalogadoRiesgo: '' },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'observations' })

  const outcome = watch('outcome')
  const isObserving = outcome === 'OBSERVED'
  // Al aprobar o finalizar el comentario es opcional: no se muestra hasta que se pide con "Agregar comentario".
  const [commentsOpen, setCommentsOpen] = useState(false)
  const showRows = isObserving || commentsOpen

  // Al elegir "Observar" siempre hay al menos una observación lista para escribir.
  useEffect(() => {
    if (isObserving && fields.length === 0) append(EMPTY_ROW)
  }, [isObserving, fields.length, append])
  const isFinalizing = outcome === 'FINALIZED'

  // Cambiar de resultado vuelve a plegar los comentarios opcionales.
  useEffect(() => {
    setCommentsOpen(false)
  }, [outcome])

  const openComments = () => {
    if (fields.length === 0) append(EMPTY_ROW)
    setCommentsOpen(true)
  }

  const removeRow = (index: number) => {
    // Quitar el último comentario opcional deja otra vez solo el botón.
    if (!isObserving && fields.length === 1) setCommentsOpen(false)
    remove(index)
  }

  const outcomeOptions: RadioCardOption<ReviewOutcome>[] = [
    {
      value: 'OBSERVED',
      label: 'Observar',
      description: 'Devuelve el expediente al investigador con observaciones por corregir.',
    },
    isCiei
      ? {
          value: 'FINALIZED',
          label: 'Finalizar con aprobación ética',
          description: 'Cierra el proceso. Solo requiere el nivel de riesgo.',
          disabled: !canFinalize,
          disabledReason: finalizeBlockedReason,
        }
      : {
          value: 'APPROVED',
          label: 'Aprobar',
          description: 'El CIC da su visto bueno y el protocolo pasa al Comité de Ética (CIEI).',
        },
  ]

  const onSubmit = async (values: ReviewFormValues) => {
    setFormError(null)
    let hasErrors = false

    // Las filas sin texto se descartan (salvo que al observar no quede ninguna completa); una fila con texto pero sin
    // tipo es un error.
    const completed: { type: ObservationType; text: string }[] = []
    const rows = isObserving || commentsOpen ? values.observations : []
    rows.forEach((row, index) => {
      const text = row.text.trim()
      if (!text) return
      if (!row.type) {
        setError(`observations.${index}.type`, { type: 'validate', message: 'Selecciona el tipo de observación.' })
        hasErrors = true
        return
      }
      completed.push({ type: row.type, text })
    })

    if (values.outcome === 'OBSERVED' && completed.length === 0 && !hasErrors) {
      if (values.observations.length === 0) {
        setFormError('Agrega al menos una observación para devolver el protocolo al investigador.')
        return
      }
      setError('observations.0.text', { type: 'validate', message: 'Describe qué debe corregir el investigador.' })
      hasErrors = true
    }

    if (isCiei && values.outcome === 'FINALIZED' && !values.catalogadoRiesgo) {
      setError('catalogadoRiesgo', { type: 'validate', message: 'Selecciona el nivel de riesgo.' })
      hasErrors = true
    }

    if (hasErrors) return

    const payload: CreateProtocolReviewInput = {
      committee,
      outcome: values.outcome,
      observations: completed,
      // El nivel de riesgo solo lo establece el CIEI.
      ...(isCiei && values.catalogadoRiesgo ? { catalogadoRiesgo: values.catalogadoRiesgo } : {}),
    }

    try {
      await createReview.mutateAsync(payload)
      onClose()
    } catch (error: unknown) {
      setFormError(getProtocolErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <p className="text-sm text-text-muted">
        Dictamen del <strong className="font-semibold text-text">{COMMITTEE_NAMES[committee]}</strong> sobre el expediente{' '}
        <strong className="font-semibold text-text">{protocol.nroExpediente}</strong>.
      </p>

      <Controller
        name="outcome"
        control={control}
        render={({ field }) => (
          <RadioCardGroup legend="Resultado del dictamen" value={field.value} onChange={field.onChange} options={outcomeOptions} />
        )}
      />

      <fieldset className="flex flex-col gap-3">
        {showRows ? (
          <>
            <legend className="mb-1 text-sm font-medium text-text">
              {isObserving ? 'Observaciones' : 'Comentario (opcional)'}
              {isObserving && (
                <span className="text-red-700" aria-hidden>
                  {' '}
                  *
                </span>
              )}
            </legend>
            {isObserving && (
              <p className="text-xs text-text-muted">
                Cada observación lleva su tipo. El investigador las verá agrupadas por tipo para saber qué corregir.
              </p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted/60 p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <FormField
                      label={isObserving ? 'Tipo de observación' : 'Tipo de comentario'}
                      htmlFor={`observations.${index}.type`}
                      error={errors.observations?.[index]?.type?.message}
                    >
                      <Select id={`observations.${index}.type`} {...register(`observations.${index}.type`)}>
                        <option value="">Selecciona un tipo</option>
                        {OBSERVATION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {OBSERVATION_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    aria-label={`Quitar ${isObserving ? 'observación' : 'comentario'} ${index + 1}`}
                    className="mt-7 flex size-9 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-white hover:text-red-700"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
                <FormField
                  label={isObserving ? 'Observación' : 'Comentario'}
                  htmlFor={`observations.${index}.text`}
                  error={errors.observations?.[index]?.text?.message}
                >
                  <Textarea id={`observations.${index}.text`} rows={3} {...register(`observations.${index}.text`)} />
                </FormField>
              </div>
            ))}

            <div>
              <Button type="button" variant="secondary" onClick={() => append(EMPTY_ROW)}>
                <PlusIcon size={16} />
                {isObserving ? 'Agregar observación' : 'Agregar otro comentario'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <legend className="sr-only">Comentarios</legend>
            <div>
              <Button type="button" variant="secondary" onClick={openComments}>
                <PlusIcon size={16} />
                Agregar comentario
              </Button>
            </div>
          </>
        )}
      </fieldset>

      {isCiei && isFinalizing && (
        <fieldset className="flex flex-col gap-4 rounded-lg border border-border bg-surface-muted/60 p-4">
          <legend className="px-1 text-sm font-semibold text-text">Evaluación ética</legend>

          <FormField
            label="Nivel de riesgo"
            htmlFor="catalogadoRiesgo"
            hint="Solo el CIEI establece el nivel de riesgo."
            error={errors.catalogadoRiesgo?.message}
            required
          >
            <Select id="catalogadoRiesgo" {...register('catalogadoRiesgo')}>
              <option value="">Selecciona un nivel</option>
              <option value="NO_RISK">Sin riesgo</option>
              <option value="MINIMAL_RISK">Riesgo mínimo</option>
              <option value="MODERATE_RISK">Riesgo moderado</option>
              <option value="HIGH_RISK">Alto riesgo</option>
            </Select>
          </FormField>

          {certificateMissing && (
            <p className="text-sm text-text-muted">
              El protocolo requiere revisión de historia clínica y no tiene certificado de buenas prácticas registrado. Esto no
              impide finalizar: puedes finalizar igual o, si prefieres, observarlo para que se complete.
            </p>
          )}
        </fieldset>
      )}

      {formError && <FormAlert>{formError}</FormAlert>}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {SUBMIT_LABEL[outcome]}
        </Button>
      </div>
    </form>
  )
}
