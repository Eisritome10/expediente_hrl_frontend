import type { ReactNode } from 'react'
import { CheckCircleIcon, PencilSimpleIcon, SealCheckIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { ObservationList } from '@/pages/protocols/ObservationList'
import { COMMITTEE_NAMES, OUTCOME_LABELS, formatReviewDate } from '@/pages/protocols/protocol-review-labels'
import type { Committee, ProtocolReviewObservation, ReviewOutcome } from '@/types/entities'

/**
 * Forma mínima de un dictamen para el historial. Sirve tanto al detalle admin
 * (con revisor) como al detalle del investigador (sin él).
 */
export interface TimelineReview {
  id: string
  committee: Committee
  outcome: ReviewOutcome
  observations: ProtocolReviewObservation[]
  createdAt: string
  reviewer?: { fullName?: string; username?: string } | null
}

/** Comentario con el que se corrigió un protocolo observado. */
export interface TimelineCorrection {
  id: string
  comment: string
  createdAt: string
}

type TimelineEntry =
  | { kind: 'review'; id: string; createdAt: string; review: TimelineReview }
  | { kind: 'correction'; id: string; createdAt: string; correction: TimelineCorrection }

/** Historial del protocolo, del más reciente al más antiguo: dictámenes (con sus observaciones por tipo) y correcciones. */
export function ProtocolReviewTimeline({
  reviews,
  corrections = [],
  pendingId,
}: {
  reviews: TimelineReview[]
  corrections?: TimelineCorrection[]
  /** Dictamen cuya observación ya se muestra destacada arriba: aquí solo se marca como pendiente. */
  pendingId?: string
}) {
  const entries: TimelineEntry[] = [
    ...reviews.map((review): TimelineEntry => ({ kind: 'review', id: review.id, createdAt: review.createdAt, review })),
    ...corrections.map(
      (correction): TimelineEntry => ({ kind: 'correction', id: correction.id, createdAt: correction.createdAt, correction }),
    ),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1
        const marker = entry.kind === 'review' ? REVIEW_MARKERS[entry.review.outcome] : CORRECTION_MARKER
        return (
          <li key={`${entry.kind}-${entry.id}`} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && <span className="absolute top-9 bottom-1 left-[15px] w-0.5 rounded-full bg-border" aria-hidden />}
            <span
              className={cn('relative flex size-8 shrink-0 items-center justify-center rounded-full', marker.className)}
              aria-hidden
            >
              {marker.icon}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
              {entry.kind === 'review' ? (
                <ReviewEntry review={entry.review} pending={entry.review.id === pendingId} />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-sm font-semibold text-text">Corrección de observaciones</span>
                    <Badge tone="info">Corregido</Badge>
                    <span className="text-xs text-text-muted">{formatReviewDate(entry.correction.createdAt)}</span>
                  </div>
                  <p className="max-w-prose text-sm whitespace-pre-wrap text-text">{entry.correction.comment}</p>
                </>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const REVIEW_MARKERS: Record<ReviewOutcome, { icon: ReactNode; className: string }> = {
  OBSERVED: { icon: <WarningCircleIcon size={18} weight="fill" />, className: 'bg-amber-50 text-amber-600' },
  APPROVED: { icon: <CheckCircleIcon size={18} weight="fill" />, className: 'bg-brand-50 text-brand-700' },
  FINALIZED: { icon: <SealCheckIcon size={18} weight="fill" />, className: 'bg-emerald-50 text-emerald-600' },
}

const CORRECTION_MARKER = { icon: <PencilSimpleIcon size={16} weight="bold" />, className: 'bg-blue-50 text-blue-600' }

/** Qué significó el dictamen cuando no trae observaciones que mostrar. */
const OUTCOME_SUMMARY: Record<ReviewOutcome, string> = {
  OBSERVED: 'Sin comentarios.',
  APPROVED: 'Aprobó el protocolo y lo envió al Comité de Ética en Investigación.',
  FINALIZED: 'Concluyó el proceso con aprobación ética.',
}

function ReviewEntry({ review, pending }: { review: TimelineReview; pending: boolean }) {
  const outcome = OUTCOME_LABELS[review.outcome]
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="text-sm font-semibold text-text">{COMMITTEE_NAMES[review.committee]}</span>
        <Badge tone={outcome.tone}>{outcome.label}</Badge>
        <span className="text-xs text-text-muted">
          {formatReviewDate(review.createdAt)}
          {review.reviewer && ` por ${review.reviewer.fullName || review.reviewer.username}`}
        </span>
      </div>
      {pending ? (
        <p className="text-sm text-text-muted">Pendiente de corregir. El detalle está en el aviso superior.</p>
      ) : review.observations.length > 0 ? (
        <ObservationList observations={review.observations} />
      ) : (
        <p className="text-sm text-text-muted">{OUTCOME_SUMMARY[review.outcome]}</p>
      )}
    </>
  )
}
