import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { CheckCircleIcon, PlusIcon, TrashIcon, XCircleIcon } from '@phosphor-icons/react'
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

const EMPTY_ROW: ObservationRow = { type: '', text: '' }

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

  // La documentación ética se registró al crear el protocolo; el CIEI solo puede finalizar si está completa.
  const documentation = [
    {
      label: 'Constancia ética',
      ok: protocol.tieneConstanciaEtica,
      detail: protocol.tieneConstanciaEtica ? protocol.idConstanciaEtica : null,
    },
    { label: 'Consentimiento informado', ok: protocol.consentimientoInformado, detail: null },
    ...(protocol.requiereRevisionHc
      ? [{ label: 'Certificado de buenas prácticas', ok: protocol.certificadoBuenasPracticas, detail: null }]
      : []),
  ]
  const documentationComplete = documentation.every((item) => item.ok)

  // El CIEI no puede finalizar con una observación pendiente ni con documentación incompleta.
  const canFinalize = isCiei && protocol.status !== 'CIEI_OBSERVED' && documentationComplete
  const finalizeBlockedReason =
    protocol.status === 'CIEI_OBSERVED'
      ? 'Disponible cuando el CIEI no tenga observaciones pendientes de subsanar.'
      : 'Falta documentación ética registrada. Observa el protocolo para que se subsane.'

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
  const isFinalizing = outcome === 'FINALIZED'

  const outcomeOptions: RadioCardOption<ReviewOutcome>[] = [
    {
      value: 'OBSERVED',
      label: 'Observar',
      description: 'Devuelve el expediente al investigador con observaciones por subsanar.',
    },
    isCiei
      ? {
          value: 'FINALIZED',
          label: 'Finalizar con aprobación ética',
          description: 'Cierra el proceso. Requiere el nivel de riesgo y la documentación ética registrada.',
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

    // Las filas totalmente vacías se descartan; una fila a medias (tipo sin texto o texto sin tipo) es un error.
    const completed: { type: ObservationType; text: string }[] = []
    values.observations.forEach((row, index) => {
      const text = row.text.trim()
      if (!row.type && !text) return
      if (!row.type) {
        setError(`observations.${index}.type`, { type: 'validate', message: 'Selecciona el tipo de observación.' })
        hasErrors = true
      }
      if (!text) {
        setError(`observations.${index}.text`, { type: 'validate', message: 'Describe la observación.' })
        hasErrors = true
      }
      if (row.type && text) completed.push({ type: row.type, text })
    })

    if (values.outcome === 'OBSERVED' && completed.length === 0 && !hasErrors) {
      if (values.observations.length === 0) {
        setFormError('Agrega al menos una observación para devolver el protocolo al investigador.')
        return
      }
      setError('observations.0.type', { type: 'validate', message: 'Selecciona el tipo de observación.' })
      setError('observations.0.text', { type: 'validate', message: 'Describe qué debe subsanar el investigador.' })
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
        <legend className="mb-1 text-sm font-medium text-text">
          {isObserving ? 'Observaciones' : 'Comentarios (opcional)'}
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
                  label="Tipo de observación"
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
                onClick={() => remove(index)}
                aria-label={`Quitar observación ${index + 1}`}
                className="mt-7 flex size-9 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-white hover:text-red-700"
              >
                <TrashIcon size={18} />
              </button>
            </div>
            <FormField
              label="Observación"
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
            Agregar observación
          </Button>
        </div>
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

          <DocumentationChecklist items={documentation} />
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

function DocumentationChecklist({ items }: { items: { label: string; ok: boolean; detail: string | null }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-text">Documentación registrada al crear el protocolo</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-text">
            {item.ok ? (
              <CheckCircleIcon size={18} weight="fill" className="shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <XCircleIcon size={18} weight="fill" className="shrink-0 text-red-600" aria-hidden />
            )}
            <span>
              {item.label}
              {item.detail && <span className="text-text-muted">{` (${item.detail})`}</span>}
              <span className="sr-only">{item.ok ? ': registrada' : ': no registrada'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
