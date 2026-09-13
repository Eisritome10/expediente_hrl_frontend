import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { CaretLeftIcon, CaretRightIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Stepper, type StepDefinition } from '@/components/ui/Stepper'
import { useCreateProtocol } from '@/hooks/useProtocols'
import { getProtocolErrorMessage } from '@/pages/protocols/protocol-error-messages'
import { ExpedienteStep } from '@/pages/protocols/steps/ExpedienteStep'
import { EquipoStep } from '@/pages/protocols/steps/EquipoStep'
import { InstitucionStep } from '@/pages/protocols/steps/InstitucionStep'
import { RevisionStep } from '@/pages/protocols/steps/RevisionStep'
import { HistoriaClinicaStep } from '@/pages/protocols/steps/HistoriaClinicaStep'
import { ResumenStep } from '@/pages/protocols/steps/ResumenStep'
import { protocolFormDefaultValues, protocolFormSchema, protocolStepFields, type ProtocolFormValues } from '@/schemas/protocol.schema'
import type { CreateProtocolInput } from '@/types/entities'

const STEPS: (StepDefinition & {
  key: keyof typeof protocolStepFields
  render: (goToStep: (index: number) => void) => ReactElement
})[] = [
  { id: 'expediente', label: 'Expediente', key: 'expediente', render: () => <ExpedienteStep /> },
  { id: 'equipo', label: 'Equipo y líneas', key: 'equipo', render: () => <EquipoStep /> },
  { id: 'institucion', label: 'Institución', key: 'institucion', render: () => <InstitucionStep /> },
  { id: 'revision', label: 'Revisión y pago', key: 'revision', render: () => <RevisionStep /> },
  { id: 'historiaClinica', label: 'Historia clínica', key: 'historiaClinica', render: () => <HistoriaClinicaStep /> },
  { id: 'resumen', label: 'Resumen', key: 'resumen', render: (goToStep) => <ResumenStep onEditStep={goToStep} /> },
]

function emptyToUndefined(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value : undefined
}

function numberOrUndefined(value: number | undefined): number | undefined {
  return value !== undefined && !Number.isNaN(value) ? value : undefined
}

function toCreateProtocolInput(values: ProtocolFormValues): CreateProtocolInput {
  return {
    nroExpediente: values.nroExpediente,
    fechaRecepcion: values.fechaRecepcion,
    titulo: values.titulo,
    disenoEstudio: values.disenoEstudio,
    lugarEjecucion: values.lugarEjecucion,
    esInstitucional: values.esInstitucional,
    investigadorPrincipalId: values.investigadorPrincipalId,
    coinvestigadorIds: values.coinvestigadorIds,
    asesorIds: values.asesorIds,
    institucionId: emptyToUndefined(values.institucionId),
    facultadId: emptyToUndefined(values.facultadId),
    destinoIds: values.destinoIds,
    lineaHrlId: values.lineaHrlId,
    lineaMeta2030Id: values.lineaMeta2030Id,
    modalidadId: values.modalidadId,
    propositoRevision: values.propositoRevision,
    fechaRevision: emptyToUndefined(values.fechaRevision),
    tipoComprobante: values.esEnmienda || values.esConvenio ? undefined : emptyToUndefined(values.tipoComprobante),
    comprobanteRevision: values.esEnmienda || values.esConvenio ? undefined : emptyToUndefined(values.comprobanteRevision),
    pagoRevision: values.esEnmienda || values.esConvenio ? undefined : numberOrUndefined(values.pagoRevision),
    esEnmienda: values.esEnmienda,
    esConvenio: values.esConvenio,
    nombreConvenio: values.esConvenio ? emptyToUndefined(values.nombreConvenio) : undefined,
    requiereRevisionHc: values.requiereRevisionHc,
    montoHc: values.requiereRevisionHc ? numberOrUndefined(values.montoHc) : undefined,
    tipoComprobanteHc: values.requiereRevisionHc ? emptyToUndefined(values.tipoComprobanteHc) : undefined,
    nroComprobanteHc: values.requiereRevisionHc ? emptyToUndefined(values.nroComprobanteHc) : undefined,
    certificadoBuenasPracticas: values.certificadoBuenasPracticas,
  }
}

export function ProtocolWizardPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const createProtocol = useCreateProtocol()

  const methods = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: protocolFormDefaultValues,
  })

  useGSAP(
    () => {
      if (!panelRef.current) return
      gsap.fromTo(panelRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
    },
    { dependencies: [stepIndex], scope: panelRef },
  )

  useEffect(() => {
    setMaxStepReached((current) => Math.max(current, stepIndex))
  }, [stepIndex])

  const currentStep = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const nroExpediente = methods.watch('nroExpediente')

  const goToStep = (index: number) => setStepIndex(Math.max(0, Math.min(index, STEPS.length - 1)))

  const goNext = async () => {
    const fields = protocolStepFields[currentStep.key]
    const isValid = fields.length === 0 || (await methods.trigger(fields as (keyof ProtocolFormValues)[]))
    if (isValid) setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))
  }

  const goBack = () => setStepIndex((index) => Math.max(index - 1, 0))

  const onSubmit = async (values: ProtocolFormValues) => {
    setFormError(null)
    try {
      const protocol = await createProtocol.mutateAsync(toCreateProtocolInput(values))
      setConfirmOpen(false)
      navigate(`/protocolos/${protocol.id}`)
    } catch (error) {
      setConfirmOpen(false)
      setFormError(getProtocolErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Nuevo protocolo</h1>
        <p className="text-sm text-text-muted">Completa los pasos para registrar un nuevo protocolo de investigación.</p>
      </div>

      <Card className="p-5">
        <Stepper steps={STEPS} currentIndex={stepIndex} maxReachedIndex={maxStepReached} onStepClick={goToStep} />
      </Card>

      <FormProvider {...methods}>
        <form
          onSubmit={(event) => event.preventDefault()}
          noValidate
          className="flex flex-col gap-6"
        >
          <Card className="p-6">
            <div ref={panelRef}>{currentStep.render(goToStep)}</div>
          </Card>

          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <WarningCircleIcon size={18} className="shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
              <CaretLeftIcon size={16} />
              Anterior
            </Button>

            {isLastStep ? (
              <Button type="button" onClick={() => setConfirmOpen(true)}>
                Registrar protocolo
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Siguiente
                <CaretRightIcon size={16} />
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={methods.handleSubmit(onSubmit)}
        loading={createProtocol.isPending}
        confirmLabel="Registrar"
        tone="brand"
        title="Confirmar registro"
        description={
          <>
            ¿Confirmas registrar el protocolo <strong>{nroExpediente || 'sin número de expediente'}</strong>? Revisa los
            datos del resumen antes de continuar — una vez registrado no se puede editar.
          </>
        }
      />
    </div>
  )
}
