import { CheckIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

export interface StepDefinition {
  id: string
  label: string
}

export function Stepper({
  steps,
  currentIndex,
  maxReachedIndex,
  onStepClick,
}: {
  steps: StepDefinition[]
  currentIndex: number
  /** Highest step index visited so far — steps up to this one are freely navigable, not just backward ones. */
  maxReachedIndex?: number
  onStepClick?: (index: number) => void
}) {
  const reachedIndex = maxReachedIndex ?? currentIndex
  // Being on a step before the furthest one reached means you came back to fix something —
  // highlight that in amber so it reads as "editing" instead of normal forward progress.
  const isEditing = currentIndex < reachedIndex

  return (
    <ol className="flex items-center">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex
        const isReached = index <= reachedIndex
        const isDone = isReached && !isCurrent
        const isEditingHere = isCurrent && isEditing
        const isLast = index === steps.length - 1
        const isClickable = index !== currentIndex && index <= reachedIndex && Boolean(onStepClick)

        const circle = (
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200',
              (isDone || isCurrent) && !isEditingHere && 'bg-brand-600 text-white',
              isCurrent && !isEditingHere && 'shadow-sm shadow-brand-900/25',
              isEditingHere && 'bg-amber-500 text-white shadow-sm shadow-amber-900/30',
              !isReached && !isCurrent && 'bg-surface-muted text-text-muted',
            )}
          >
            {isDone ? <CheckIcon size={14} weight="bold" /> : index + 1}
          </span>
        )

        const label = (
          <span
            className={cn(
              'hidden text-sm font-medium whitespace-nowrap sm:inline',
              isEditingHere ? 'text-amber-700' : isCurrent ? 'text-text' : 'text-text-muted',
            )}
          >
            {step.label}
            {isEditingHere && <span className="ml-1 text-xs font-normal text-amber-600">(editando)</span>}
          </span>
        )

        const isLineEditing = isEditing && (index === currentIndex || index === currentIndex - 1)

        return (
          <li key={step.id} className={cn('flex items-center', !isLast && 'flex-1')}>
            {isClickable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                className="flex shrink-0 items-center gap-2.5 rounded-md transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2"
                aria-label={`Ir al paso ${step.label}`}
              >
                {circle}
                {label}
              </button>
            ) : (
              <div className="flex shrink-0 items-center gap-2.5">
                {circle}
                {label}
              </div>
            )}
            {!isLast && (
              <div
                className={cn(
                  'mx-3 h-px flex-1 transition-colors duration-200',
                  isLineEditing ? 'bg-amber-500' : index < reachedIndex ? 'bg-brand-600' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
