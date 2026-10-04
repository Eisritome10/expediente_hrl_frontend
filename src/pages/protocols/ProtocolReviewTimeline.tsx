import { Badge } from '@/components/ui/Badge'
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
        return (
          <li key={`${entry.kind}-${entry.id}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && <span className="absolute top-5 bottom-0 left-[5px] w-px bg-border" aria-hidden />}
            <span
              className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-white bg-brand-600 ring-1 ring-brand-600"
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {entry.kind === 'review' ? (
                <ReviewEntry review={entry.review} pending={entry.review.id === pendingId} />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-sm font-semibold text-text">Corrección</span>
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

function ReviewEntry({ review, pending }: { review: TimelineReview; pending: boolean }) {
  const outcome = OUTCOME_LABELS[review.outcome]
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="text-sm font-semibold text-text">{review.committee}</span>
        <Badge tone={outcome.tone}>{outcome.label}</Badge>
        <span className="text-xs text-text-muted">
          {formatReviewDate(review.createdAt)}
          {review.reviewer && ` por ${review.reviewer.fullName || review.reviewer.username}`}
        </span>
      </div>
      <p className="sr-only">{COMMITTEE_NAMES[review.committee]}</p>
      {pending ? (
        <p className="text-sm text-text-muted">Pendiente de corregir. El detalle está en el aviso superior.</p>
      ) : review.observations.length > 0 ? (
        <ObservationList observations={review.observations} />
      ) : (
        <p className="text-sm text-text-muted">Sin comentarios.</p>
      )}
    </>
  )
}
