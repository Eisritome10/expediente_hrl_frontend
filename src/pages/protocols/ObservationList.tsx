import { Badge } from '@/components/ui/Badge'
import { observationTypeLabel } from '@/pages/protocols/protocol-review-labels'
import type { ObservationType, ProtocolReviewObservation } from '@/types/entities'

interface ObservationGroup {
  type: ObservationType | null
  texts: string[]
}

/** Agrupa observaciones consecutivas del mismo tipo (el backend las entrega ordenadas por tipo). */
function groupByType(observations: ProtocolReviewObservation[]): ObservationGroup[] {
  const groups: ObservationGroup[] = []
  for (const observation of observations) {
    const last = groups[groups.length - 1]
    if (last && last.type === observation.type) {
      last.texts.push(observation.text)
    } else {
      groups.push({ type: observation.type, texts: [observation.text] })
    }
  }
  return groups
}

/** Observaciones de un dictamen, agrupadas por tipo, con el texto completo y legible. */
export function ObservationList({ observations }: { observations: ProtocolReviewObservation[] }) {
  if (observations.length === 0) return null

  return (
    <ul className="flex flex-col gap-3">
      {groupByType(observations).map((group, index) => (
        <li key={`${group.type ?? 'general'}-${index}`} className="flex flex-col gap-1.5">
          <div>
            <Badge tone="neutral">{observationTypeLabel(group.type)}</Badge>
          </div>
          <ul className="flex max-w-prose flex-col gap-1.5">
            {group.texts.map((text, textIndex) => (
              <li key={textIndex} className="text-sm whitespace-pre-wrap text-text">
                {text}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
