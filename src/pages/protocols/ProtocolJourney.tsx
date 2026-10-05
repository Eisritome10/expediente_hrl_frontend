import { useEffect, useState, type ReactNode } from 'react'
import {
  CheckIcon,
  ClipboardTextIcon,
  FlagCheckeredIcon,
  ScalesIcon,
  SealCheckIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import { buildJourney, type JourneyStage, type JourneyStageId } from '@/pages/protocols/protocol-journey'
import { formatReviewDate } from '@/pages/protocols/protocol-review-labels'
import type { ResearcherProtocolDetail } from '@/types/entities'

const STAGE_ICONS: Record<JourneyStageId, ReactNode> = {
  registered: <ClipboardTextIcon size={20} weight="bold" aria-hidden />,
  clinical: <StethoscopeIcon size={20} weight="bold" aria-hidden />,
  ethics: <ScalesIcon size={20} weight="bold" aria-hidden />,
  concluded: <FlagCheckeredIcon size={20} weight="bold" aria-hidden />,
}

/** Los avances se dibujan al abrir la pantalla: el recorrido "camina" hasta donde está el protocolo. */
function useReveal() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  return ready
}

/** Recorrido del protocolo en cuatro etapas: lo ya completado, dónde está ahora y dónde termina. */
export function ProtocolJourney({ protocol }: { protocol: ResearcherProtocolDetail }) {
  const journey = buildJourney(protocol)
  const ready = useReveal()
  const stepNumber = journey.currentIndex + 1

  return (
    <section aria-labelledby="journey-title" className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="journey-title" className="text-base font-semibold text-text">
          Seguimiento de tu protocolo
        </h2>
        <p className="text-sm text-text-muted">
          {journey.concluded ? 'Las 4 etapas completadas' : `Etapa ${stepNumber} de ${journey.stages.length}`}
        </p>
      </div>

      <ol className="flex flex-col md:flex-row">
        {journey.stages.map((stage, index) => (
          <JourneyStep
            key={stage.id}
            stage={stage}
            attention={journey.needsAction && stage.state === 'current'}
            isLast={index === journey.stages.length - 1}
            fillsNext={index < journey.currentIndex || (journey.concluded && index < journey.stages.length - 1)}
            index={index}
            ready={ready}
          />
        ))}
      </ol>

      <div
        aria-live="polite"
        className={cn(
          'mt-7 flex flex-col gap-1.5 rounded-xl px-4 py-4 sm:px-5',
          journey.needsAction ? 'bg-amber-50 text-amber-950' : 'bg-brand-50 text-brand-900',
        )}
      >
        <h3 className="text-lg font-semibold text-balance">{journey.headline}</h3>
        <p className={cn('max-w-prose text-sm', journey.needsAction ? 'text-amber-900' : 'text-brand-900/80')}>
          {journey.detail}
        </p>
        {!journey.concluded && (
          <p className={cn('mt-1 max-w-prose text-sm', journey.needsAction ? 'text-amber-900' : 'text-brand-900/80')}>
            <span className="font-semibold">Después:</span> {journey.nextStep}.{' '}
            <span className="font-semibold">Meta final:</span> {journey.goal.toLowerCase()}.
          </p>
        )}
      </div>
    </section>
  )
}

function JourneyStep({
  stage,
  attention,
  isLast,
  fillsNext,
  index,
  ready,
}: {
  stage: JourneyStage
  attention: boolean
  isLast: boolean
  /** El tramo que sale de esta etapa hacia la siguiente ya fue recorrido. */
  fillsNext: boolean
  index: number
  ready: boolean
}) {
  const { state } = stage
  const isConcludedStage = stage.id === 'concluded' && state === 'done'

  const statusLabel =
    state === 'done'
      ? stage.completedAt
        ? `Completado · ${formatReviewDate(stage.completedAt)}`
        : 'Completado'
      : state === 'current'
        ? attention
          ? 'Requiere tu corrección'
          : 'En curso'
        : 'Pendiente'

  return (
    <li aria-current={state === 'current' ? 'step' : undefined} className="relative flex gap-4 pb-8 last:pb-0 md:flex-1 md:flex-col md:gap-3 md:pb-0">
      {!isLast && (
        <>
          <span
            aria-hidden
            className="absolute top-12 bottom-1 left-[19px] w-0.5 rounded-full bg-border md:top-[19px] md:right-2 md:bottom-auto md:left-12 md:h-0.5 md:w-auto"
          />
          <span
            aria-hidden
            style={{ transitionDelay: `${index * 220}ms` }}
            className={cn(
              'absolute top-12 bottom-1 left-[19px] w-0.5 origin-top rounded-full bg-brand-600 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:top-[19px] md:right-2 md:bottom-auto md:left-12 md:h-0.5 md:w-auto md:origin-left',
              fillsNext && ready ? 'scale-y-100 md:scale-x-100' : 'scale-y-0 md:scale-x-0 md:scale-y-100',
            )}
          />
        </>
      )}

      <span className="relative size-10 shrink-0">
        {state === 'current' && (
          <span
            aria-hidden
            className={cn(
              'absolute inset-0 rounded-full motion-safe:animate-ping',
              attention ? 'bg-amber-400/40' : 'bg-brand-500/30',
            )}
          />
        )}
        <span
          className={cn(
            'relative flex size-10 items-center justify-center rounded-full border-2 transition-colors',
            state === 'done' && 'border-brand-600 bg-brand-600 text-white',
            state === 'current' && !attention && 'border-brand-600 bg-white text-brand-700',
            state === 'current' && attention && 'border-amber-500 bg-white text-amber-700',
            state === 'upcoming' && 'border-border-strong/50 bg-white text-text-muted',
          )}
        >
          {isConcludedStage ? (
            <SealCheckIcon size={22} weight="fill" aria-hidden />
          ) : state === 'done' ? (
            <CheckIcon size={20} weight="bold" aria-hidden />
          ) : (
            STAGE_ICONS[stage.id]
          )}
        </span>
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1 md:pt-0 md:pr-3">
        <p className={cn('text-sm font-semibold text-balance', state === 'upcoming' ? 'text-text-muted' : 'text-text')}>
          {stage.title}
        </p>
        <p
          className={cn(
            'text-xs font-medium',
            state === 'done' && 'text-brand-700',
            state === 'current' && (attention ? 'text-amber-800' : 'text-brand-700'),
            state === 'upcoming' && 'text-text-muted',
          )}
        >
          {statusLabel}
        </p>
        <p className="max-w-[28ch] text-xs text-text-muted">{stage.description}</p>
      </div>
    </li>
  )
}
