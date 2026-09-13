import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProtocol } from '@/hooks/useProtocols'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <dt className="text-xs font-medium text-text-muted uppercase">{label}</dt>
      <dd className="text-sm text-text">{value || '—'}</dd>
    </div>
  )
}

export function ProtocolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: protocol, isPending, isError } = useProtocol(id ?? null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate('/protocolos')} aria-label="Volver a protocolos">
          <ArrowLeftIcon size={16} />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-text">{protocol ? protocol.nroExpediente : 'Protocolo'}</h1>
          <p className="text-sm text-text-muted">Detalle del protocolo de investigación.</p>
        </div>
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
          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">Expediente</h2>
            <dl className="divide-y divide-border">
              <Row label="Título" value={protocol.titulo} />
              <Row label="Diseño del estudio" value={protocol.disenoEstudio} />
              <Row label="Lugar de ejecución" value={protocol.lugarEjecucion} />
              <Row label="Fecha de recepción" value={protocol.fechaRecepcion.slice(0, 10)} />
              <Row label="Institucional" value={protocol.esInstitucional ? 'Sí' : 'No'} />
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
            <h2 className="mb-1 text-sm font-semibold text-text">Revisión, pago e historia clínica</h2>
            <dl className="divide-y divide-border">
              <Row label="Propósito de la revisión" value={protocol.propositoRevision} />
              <Row label="Fecha de revisión" value={protocol.fechaRevision?.slice(0, 10) ?? ''} />
              <Row label="Enmienda" value={protocol.esEnmienda ? 'Sí' : 'No'} />
              <Row label="Convenio" value={protocol.esConvenio ? `Sí — ${protocol.nombreConvenio}` : 'No'} />
              <Row
                label="Pago de revisión"
                value={
                  protocol.pagoRevision
                    ? `S/ ${protocol.pagoRevision.toFixed(2)} (${protocol.tipoComprobante ?? ''} ${protocol.comprobanteRevision ?? ''})`
                    : ''
                }
              />
              <Row label="Requiere revisión de HC" value={protocol.requiereRevisionHc ? 'Sí' : 'No'} />
              {protocol.requiereRevisionHc && (
                <Row
                  label="Detalle de HC"
                  value={`S/ ${(protocol.montoHc ?? 0).toFixed(2)} — ${protocol.tipoComprobanteHc ?? ''} ${protocol.nroComprobanteHc ?? ''}`}
                />
              )}
              <Row label="Certificado de buenas prácticas" value={protocol.certificadoBuenasPracticas ? 'Sí' : 'No'} />
            </dl>
          </Card>
        </>
      )}
    </div>
  )
}
