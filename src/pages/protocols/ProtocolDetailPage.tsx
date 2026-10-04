import { useState, type ReactNode } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CheckCircleIcon, ClockCounterClockwiseIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProtocol } from '@/hooks/useProtocols'
import { useProtocolReviewsList } from '@/hooks/useProtocolReviews'
import { ProtocolStatusBadge } from '@/pages/protocols/ProtocolStatusBadge'
import { ProtocolReviewDialog } from '@/pages/protocols/ProtocolReviewDialog'
import { ProtocolCorrectDialog } from '@/pages/protocols/ProtocolCorrectDialog'
import { PendingObservationPanel } from '@/pages/protocols/PendingObservationPanel'
import { ProtocolReviewTimeline } from '@/pages/protocols/ProtocolReviewTimeline'

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <dt className="text-xs font-medium text-text-muted uppercase">{label}</dt>
      <dd className="text-sm text-text">{value || '—'}</dd>
    </div>
  )
}

const riskLevelLabels: Record<string, string> = {
  NO_RISK: 'Sin riesgo',
  MINIMAL_RISK: 'Riesgo mínimo',
  MODERATE_RISK: 'Riesgo moderado',
  HIGH_RISK: 'Alto riesgo',
}

export function ProtocolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: protocol, isPending, isError } = useProtocol(id ?? null)
  const { data: reviewsData, isPending: loadingReviews } = useProtocolReviewsList(id ?? null, { limit: 100 })

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [correctDialogOpen, setCorrectDialogOpen] = useState(false)

  const isObserved = protocol?.status === 'CIC_OBSERVED' || protocol?.status === 'CIEI_OBSERVED'
  const isFinalized = protocol?.status === 'FINALIZED'

  // El CIC queda cerrado cuando el protocolo ya entró en la fase del CIEI o cuando
  // el último dictamen del CIC fue APPROVED (las revisiones llegan ordenadas de más reciente a más antigua).
  const lastCicOutcome = reviewsData?.data.find((review) => review.committee === 'CIC')?.outcome ?? null
  const cicClosed =
    protocol?.status === 'CIEI_OBSERVED' ||
    protocol?.status === 'CIEI_CORRECTED' ||
    protocol?.status === 'FINALIZED' ||
    lastCicOutcome === 'APPROVED'

  // La observación que hay que corregir: el último dictamen OBSERVED del comité en cuyo estado está el protocolo.
  const observingCommittee = protocol?.status === 'CIEI_OBSERVED' ? 'CIEI' : 'CIC'
  const pendingObservation =
    reviewsData?.data.find((review) => review.outcome === 'OBSERVED' && review.committee === observingCommittee) ?? null

  // El pago de revisión se registra al crear el protocolo; enmienda y convenio quedan exonerados.
  const paymentValue: ReactNode = (() => {
    if (!protocol) return ''
    if (protocol.esEnmienda || protocol.convenio) return 'Exonerado (S/ 0.00)'
    if (protocol.pagoRevision != null) {
      const comprobante = [protocol.tipoComprobante, protocol.comprobanteRevision].filter(Boolean).join(' ')
      return `S/ ${protocol.pagoRevision.toFixed(2)}${comprobante ? ` (${comprobante})` : ''}`
    }
    return 'No registrado'
  })()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/protocolos')} aria-label="Volver a protocolos">
            <ArrowLeftIcon size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-text">{protocol ? protocol.nroExpediente : 'Protocolo'}</h1>
              {protocol && <ProtocolStatusBadge status={protocol.status} />}
            </div>
            <p className="text-sm text-text-muted">Detalle del protocolo de investigación.</p>
          </div>
        </div>

        {protocol && (
          <div className="flex items-center gap-2">
            {!isFinalized && (
              <Button onClick={() => setReviewDialogOpen(true)} disabled={loadingReviews} className="gap-1.5">
                <CheckCircleIcon size={16} />
                Registrar dictamen
              </Button>
            )}
          </div>
        )}
      </div>

      {isError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar el protocolo. Verifica tu conexión e intenta nuevamente.
        </div>
      )}

      {isPending && (
        <Card className="p-6">
          <Skeleton className="mb-3 h-4 w-1/3" />
          <Skeleton className="mb-3 h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      )}

      {protocol && (
        <>
          {isObserved && (
            <PendingObservationPanel observation={pendingObservation} onCorrect={() => setCorrectDialogOpen(true)} />
          )}

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClockCounterClockwiseIcon size={18} className="text-text-muted" aria-hidden />
              <h2 className="text-sm font-semibold text-text">Historial de dictámenes</h2>
            </div>

            {loadingReviews ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (reviewsData && reviewsData.data.length > 0) || protocol.corrections.length > 0 ? (
              <ProtocolReviewTimeline
                reviews={reviewsData?.data ?? []}
                corrections={protocol.corrections}
                pendingId={isObserved ? pendingObservation?.id : undefined}
              />
            ) : (
              <p className="text-sm text-text-muted">Aún no hay dictámenes. El primero lo registra el CIC.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">Expediente</h2>
            <dl className="divide-y divide-border">
              <Row label="Título" value={protocol.titulo} />
              <Row label="Diseño del estudio" value={protocol.disenosEstudio?.map((d) => d.name).join(', ') ?? ''} />
              <Row label="Lugar de ejecución" value={protocol.lugarEjecucion} />
              <Row label="Fecha de recepción" value={protocol.fechaRecepcion.slice(0, 10)} />
              <Row label="Institucional" value={protocol.esInstitucional ? 'Sí' : 'No'} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">Evaluación ética</h2>
            <dl className="divide-y divide-border">
              {protocol.requiereRevisionHc && (
                <Row label="Certificado de buenas prácticas" value={protocol.certificadoBuenasPracticas ? 'Sí' : 'No'} />
              )}
              {/* Datos históricos: ya no se piden al registrar, pero los protocolos antiguos pueden tenerlos. */}
              {protocol.tieneConstanciaEtica && (
                <Row
                  label="Constancia ética"
                  value={[protocol.idConstanciaEtica, protocol.fechaConstancia?.slice(0, 10)].filter(Boolean).join(', ')}
                />
              )}
              {protocol.consentimientoInformado && <Row label="Consentimiento informado" value="Sí" />}
              {protocol.departamentoDirigidoPermiso && (
                <Row label="Departamento dirigido" value={protocol.departamentoDirigidoPermiso} />
              )}
              <Row
                label="Nivel de riesgo (CIEI)"
                value={
                  protocol.catalogadoRiesgo
                    ? (riskLevelLabels[protocol.catalogadoRiesgo] ?? protocol.catalogadoRiesgo)
                    : 'Lo establece el CIEI'
                }
              />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">Equipo y líneas</h2>
            <dl className="divide-y divide-border">
              <Row
                label="Investigador principal"
                value={`${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}`}
              />
              <Row
                label="Coinvestigadores"
                value={protocol.coinvestigadores.map((r) => `${r.firstName} ${r.lastName}`).join(', ')}
              />
              <Row label="Asesores" value={protocol.asesores.map((r) => `${r.firstName} ${r.lastName}`).join(', ')} />
              <Row label="Línea HRL" value={protocol.lineaHrl.name} />
              <Row label="Línea Meta 2030" value={protocol.lineaMeta2030.name} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">Institución y modalidad</h2>
            <dl className="divide-y divide-border">
              <Row label="Institución" value={protocol.institucion?.name ?? ''} />
              <Row label="Facultad" value={protocol.facultad?.name ?? ''} />
              <Row label="Destinos" value={protocol.destinos.map((d) => d.name).join(', ')} />
              <Row label="Modalidad" value={`${protocol.modalidad.name} · S/ ${protocol.modalidad.fee.toFixed(2)}`} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">Pago e historia clínica</h2>
            <dl className="divide-y divide-border">
              {protocol.propositoRevision && <Row label="Propósito de la revisión (histórico)" value={protocol.propositoRevision} />}
              {protocol.fechaRevision && <Row label="Fecha de revisión (histórica)" value={protocol.fechaRevision.slice(0, 10)} />}
              <Row label="Enmienda" value={protocol.esEnmienda ? 'Sí' : 'No'} />
              {protocol.protocoloOriginal && (
                <Row
                  label="Enmienda de"
                  value={
                    <Link to={`/protocolos/${protocol.protocoloOriginal.id}`} className="text-brand-700 hover:underline">
                      {protocol.protocoloOriginal.nroExpediente}
                    </Link>
                  }
                />
              )}
              <Row
                label="Convenio"
                value={protocol.convenio ? `Sí: ${protocol.convenio.name}` : protocol.esConvenio ? 'Sí' : 'No'}
              />
              <Row label="Pago de revisión" value={paymentValue} />
              <Row label="Requiere revisión de HC" value={protocol.requiereRevisionHc ? 'Sí' : 'No'} />
              {protocol.requiereRevisionHc && (
                <Row
                  label="Detalle de HC"
                  value={`S/ ${(protocol.montoHc ?? 0).toFixed(2)} (${protocol.tipoComprobanteHc ?? ''} ${protocol.nroComprobanteHc ?? ''})`}
                />
              )}
            </dl>
          </Card>

          <ProtocolReviewDialog
            open={reviewDialogOpen}
            onClose={() => setReviewDialogOpen(false)}
            protocol={protocol}
            cicClosed={cicClosed}
          />

          <ProtocolCorrectDialog
            open={correctDialogOpen}
            onClose={() => setCorrectDialogOpen(false)}
            protocol={protocol}
            observation={pendingObservation}
          />
        </>
      )}
    </div>
  )
}
