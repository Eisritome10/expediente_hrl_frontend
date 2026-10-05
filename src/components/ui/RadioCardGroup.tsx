import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface RadioCardOption<T extends string> {
  value: T
  label: string
  /** Qué provoca elegir esta opción, en lenguaje llano. */
  description: string
  disabled?: boolean
  /** Por qué no está disponible (se muestra en lugar de la descripción). */
  disabledReason?: string
  icon?: ReactNode
}

/** Elección única entre pocas opciones cuyas consecuencias conviene ver sin abrir nada. */
export function RadioCardGroup<T extends string>({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string
  value: T
  onChange: (value: T) => void
  options: RadioCardOption<T>[]
}) {
  const name = useId()

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium text-text">{legend}</legend>
      {options.map((option) => {
        const checked = option.value === value
        return (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-brand-500/40',
              checked ? 'border-brand-600 bg-brand-50/60' : 'border-border-strong bg-surface',
              option.disabled ? 'cursor-not-allowed bg-surface-muted' : 'cursor-pointer hover:border-brand-500',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="mt-0.5 size-4 shrink-0"
            />
            <span className="flex flex-col gap-0.5">
              <span className={cn('text-sm font-medium', option.disabled ? 'text-text-muted' : 'text-text')}>
                {option.label}
              </span>
              <span className="text-xs text-text-muted">
                {option.disabled && option.disabledReason ? option.disabledReason : option.description}
              </span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
