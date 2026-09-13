import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={Boolean(error)}
      className={cn(
        'w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted',
        error && 'border-red-400 focus:ring-red-400/30 focus:border-red-500',
        className,
      )}
      {...props}
    />
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, id, rows = 3, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      aria-invalid={Boolean(error)}
      className={cn(
        'w-full resize-y rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-400/30',
        className,
      )}
      {...props}
    />
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error, id, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full appearance-none rounded-lg border border-border bg-white px-3.5 py-2.5 pr-9 text-sm text-text focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-400/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDownIcon
        size={14}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-text-muted"
      />
    </div>
  )
})

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {label}
        {required && (
          <span className="text-red-600" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
