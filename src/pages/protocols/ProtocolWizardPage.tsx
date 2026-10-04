import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Stepper, type StepDefinition } from '@/components/ui/Stepper'
import { useCreateProtocol, useProtocol } from '@/hooks/useProtocols'
import { getProtocolErrorMessage } from '@/pages/protocols/protocol-error-messages'
import { TipoRegistroStep } from '@/pages/protocols/steps/TipoRegistroStep'
import { ExpedienteStep } from '@/pages/protocols/steps/ExpedienteStep'
import { EquipoStep } from '@/pages/protocols/steps/EquipoStep'
import { InstitucionPagoStep } from '@/pages/protocols/steps/InstitucionPagoStep'
import { HistoriaClinicaStep } from '@/pages/protocols/steps/HistoriaClinicaStep'
import { ResumenStep } from '@/pages/protocols/steps/ResumenStep'
import { HC_REVIEW_FEE, protocolFormDefaultValues, protocolFormSchema, protocolStepFields, type ProtocolFormValues } from '@/schemas/protocol.schema'
import type { CreateProtocolInput } from '@/types/entities'
import { FormAlert } from '@/components/ui/FormAlert'

const STEPS: (StepDefinition & {
  key: keyof typeof protocolStepFields
  render: (goToStep: (index: number) => void) => ReactElement
})[] = [
  { id: 'tipo', label: 'Tipo de registro', key: 'tipo', render: () => <TipoRegistroStep /> },
  { id: 'expediente', label: 'Expediente', key: 'expediente', render: () => <ExpedienteStep /> },
  { id: 'equipo', label: 'Equipo y líneas', key: 'equipo', render: () => <EquipoStep /> },
  { id: 'institucionPago', label: 'Institución y pago', key: 'institucionPago', render: () => <InstitucionPagoStep /> },
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
  const convenioId = values.esConvenio ? emptyToUndefined(values.convenioId) : undefined
  const exonerado = values.esEnmienda || values.esConvenio
  return {
    nroExpediente: values.nroExpediente,
    fechaRecepcion: values.fechaRecepcion,
    titulo: values.titulo,
    lugarEjecucion: values.lugarEjecucion,
    esInstitucional: values.esInstitucional,
    investigadorPrincipalId: values.investigadorPrincipalId,
    coinvestigadorIds: values.coinvestigadorIds,
    asesorIds: values.asesorIds,
    institucionId: emptyToUndefined(values.institucionId),
    facultadId: emptyToUndefined(values.facultadId),
    destinoIds: values.destinoIds,
    studyDesignIds: values.studyDesignIds,
    lineaHrlId: values.lineaHrlId,
    lineaMeta2030Id: values.lineaMeta2030Id,
    modalidadId: values.modalidadId,
    convenioId,
    pagoRevision: exonerado ? 0 : numberOrUndefined(values.pagoRevision),
    tipoComprobante: exonerado ? undefined : emptyToUndefined(values.tipoComprobante),
    comprobanteRevision: exonerado ? undefined : emptyToUndefined(values.comprobanteRevision)?.trim().toUpperCase(),
    protocoloOriginalId: emptyToUndefined(values.protocoloOriginalId),
    requiereRevisionHc: values.requiereRevisionHc,
    montoHc: values.requiereRevisionHc ? HC_REVIEW_FEE : undefined,
    tipoComprobanteHc: values.requiereRevisionHc ? emptyToUndefined(values.tipoComprobanteHc) : undefined,
    nroComprobanteHc: values.requiereRevisionHc ? emptyToUndefined(values.nroComprobanteHc) : undefined,
    certificadoBuenasPracticas: values.requiereRevisionHc ? values.certificadoBuenasPracticas : false,
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
  const esEnmienda = methods.watch('esEnmienda')
  const protocoloOriginalId = methods.watch('protocoloOriginalId')
  const { data: originalProtocol } = useProtocol(esEnmienda && protocoloOriginalId ? protocoloOriginalId : null)

  const goToStep = (index: number) => setStepIndex(Math.max(0, Math.min(index, STEPS.length - 1)))

  const goNext = async () => {
    const fields = protocolStepFields[currentStep.key]
    const isValid = fields.length === 0 || (await methods.trigger(fields))
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
            <FormAlert>{formError}</FormAlert>
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
          esEnmienda ? (
            <>
              ¿Confirmas registrar la enmienda del protocolo original{' '}
              <strong>N° {originalProtocol?.nroExpediente ?? 'seleccionado'}</strong>? Revisa los datos del resumen antes
              de continuar. Una vez registrada no se puede editar.
            </>
          ) : (
            <>
              ¿Confirmas registrar el protocolo <strong>{nroExpediente || 'sin número de expediente'}</strong>? Revisa los
              datos del resumen antes de continuar. Una vez registrado no se puede editar.
            </>
          )
        }
      />
    </div>
  )
}
