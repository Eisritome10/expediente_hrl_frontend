import { PencilSimpleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ObservationList } from '@/pages/protocols/ObservationList'
import { COMMITTEE_NAMES, formatReviewDate } from '@/pages/protocols/protocol-review-labels'
import type { Committee, ProtocolReviewObservation } from '@/types/entities'

/** Forma mínima de un dictamen observado: sirve al detalle admin (con revisor) y al del investigador (sin él). */
export interface PendingObservation {
  committee: Committee
  observations: ProtocolReviewObservation[]
  createdAt: string
  reviewer?: { fullName?: string; username?: string } | null
}

/** Lo primero que ve quien abre un protocolo observado: qué se pidió, de qué tipo, cuándo, y el siguiente paso. */
export function PendingObservationPanel({
  observation,
  onCorrect,
}: {
  observation: PendingObservation | null
  /** Si no se pasa, el investigador no puede corregir y se le indica acudir a la OADI. */
  onCorrect?: () => void
}) {
  return (
    <section
      aria-labelledby="pending-observation-title"
      className="flex flex-col gap-4 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
    >
      <div className="flex items-start gap-3">
        <WarningCircleIcon size={22} weight="fill" className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id="pending-observation-title" className="text-base font-semibold">
            {observation ? `${COMMITTEE_NAMES[observation.committee]} dejó observaciones` : 'Observaciones pendientes'}
          </h2>
          {observation && (
            <p className="text-xs text-amber-900">
              {formatReviewDate(observation.createdAt)}
              {observation.reviewer && ` por ${observation.reviewer.fullName || observation.reviewer.username}`}
            </p>
          )}
        </div>
      </div>

      {observation && observation.observations.length > 0 && (
        <div className="rounded-lg bg-white/70 px-4 py-3">
          <ObservationList observations={observation.observations} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-prose text-sm text-amber-900">
          {onCorrect
            ? 'Corrige el expediente según estas observaciones. Al enviar la corrección, el comité podrá volver a evaluarlo.'
            : 'Acércate a la OADI para subsanarla.'}
        </p>
        {onCorrect && (
          <Button onClick={onCorrect} className="shrink-0">
            <PencilSimpleIcon size={16} />
            Subsanar observación
          </Button>
        )}
      </div>
    </section>
  )
}
