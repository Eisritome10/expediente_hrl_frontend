import { useId } from 'react'
import { cn } from '@/lib/cn'

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}) {
  const labelId = useId()
  const descriptionId = useId()

  return (
    <label
      className={cn(
        'flex items-start justify-between gap-4 rounded-lg border bg-white px-4 py-3 transition-colors',
        checked ? 'border-brand-300 bg-brand-50/50' : 'border-border-strong',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand-500',
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span id={labelId} className="text-sm font-medium text-text">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-xs text-text-muted">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2',
          checked ? 'bg-brand-600' : 'bg-border-strong',
        )}
      >
        <span
          className={cn(
            'inline-block size-4.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </label>
  )
}
