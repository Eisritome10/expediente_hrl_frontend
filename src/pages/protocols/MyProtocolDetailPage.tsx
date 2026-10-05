import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, ClipboardTextIcon, LinkBreakIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useMyProtocol } from '@/hooks/useProtocols'
import { ProtocolStatusBadge } from '@/pages/protocols/ProtocolStatusBadge'
import { PendingObservationPanel } from '@/pages/protocols/PendingObservationPanel'
import { ProtocolJourney } from '@/pages/protocols/ProtocolJourney'
import { ProtocolReviewTimeline } from '@/pages/protocols/ProtocolReviewTimeline'
import { formatReviewDate } from '@/pages/protocols/protocol-review-labels'
import { RESEARCHER_STATUS_HINT } from '@/pages/protocols/protocol-status'
import { ApiError } from '@/types/common'
import type { Committee } from '@/types/entities'

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <dt className="text-xs font-medium text-text-muted uppercase">{label}</dt>
      <dd className="text-sm text-text">{value || '—'}</dd>
    </div>
  )
}

export function MyProtocolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: protocol, isPending, isError, error } = useMyProtocol(id ?? null)

  const isNotLinked = error instanceof ApiError && error.body?.errorCode === 'RESEARCHER_ACCOUNT_NOT_LINKED'
  const isNotFound = error instanceof ApiError && error.status === 404

  const reviews = protocol?.reviews ?? []
  const isObserved = protocol?.status === 'CIC_OBSERVED' || protocol?.status === 'CIEI_OBSERVED'
  const observingCommittee: Committee = protocol?.status === 'CIEI_OBSERVED' ? 'CIEI' : 'CIC'
  const pendingObservation =
    reviews.find((review) => review.outcome === 'OBSERVED' && review.committee === observingCommittee) ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate('/mis-protocolos')} aria-label="Volver a mis protocolos">
          <ArrowLeftIcon size={16} />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-text">{protocol ? protocol.nroExpediente : 'Protocolo'}</h1>
            {protocol && <ProtocolStatusBadge status={protocol.status} audience="researcher" />}
          </div>
          {protocol && <p className="mt-1 text-sm text-text-muted">{RESEARCHER_STATUS_HINT[protocol.status]}</p>}
        </div>
      </div>

      {isNotLinked ? (
        <NoticePanel
          icon={<LinkBreakIcon size={28} />}
          title="Tu cuenta aún no está vinculada a un investigador"
          body="Comunícate con la oficina de investigación para que vinculen tu cuenta a tu registro de investigador."
        />
      ) : isNotFound ? (
        <NoticePanel
          icon={<ClipboardTextIcon size={28} />}
          title="No encontramos este protocolo"
          body="El protocolo no existe o no está asociado a tu cuenta de investigador."
        />
      ) : isError ? (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <WarningCircleIcon size={18} weight="fill" className="shrink-0 text-red-600" aria-hidden />
          No se pudo cargar el protocolo. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : isPending || !protocol ? (
        <Card className="p-6">
          <Skeleton className="mb-3 h-4 w-1/3" />
          <Skeleton className="mb-3 h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      ) : (
        <>
          <ProtocolJourney protocol={protocol} />

          {isObserved && <PendingObservationPanel observation={pendingObservation} />}

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-text">Datos del protocolo</h2>
            <dl className="divide-y divide-border">
              <Row label="Título" value={protocol.titulo} />
              {protocol.protocoloOriginal && (
                <Row label="Enmienda de" value={`N° ${protocol.protocoloOriginal.nroExpediente}`} />
              )}
              <Row label="Fecha de recepción" value={formatReviewDate(protocol.fechaRecepcion)} />
              <Row
                label="Investigador principal"
                value={`${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}`}
              />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-5 text-base font-semibold text-text">Historial del seguimiento</h2>
            {reviews.length > 0 || protocol.corrections.length > 0 ? (
              <ProtocolReviewTimeline
                reviews={reviews}
                corrections={protocol.corrections}
                pendingId={isObserved ? pendingObservation?.id : undefined}
              />
            ) : (
              <p className="text-sm text-text-muted">Aún no hay novedades. La primera la registra el Comité de Investigación Clínica.</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

function NoticePanel({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">{icon}</span>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <p className="max-w-sm text-sm text-text-muted">{body}</p>
    </div>
  )
}
