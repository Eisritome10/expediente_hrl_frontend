import {
  createContext,
  forwardRef,
  use,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { CaretDownIcon, EyeIcon, EyeSlashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

interface FormFieldContextValue {
  fieldId: string
  hintId: string
  errorId: string
  hasHint: boolean
  hasError: boolean
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

/** Vincula el control con su ayuda y su error (aria-describedby) sin que cada formulario lo cablee a mano. */
function useFieldA11y(id: string | undefined, error: string | undefined) {
  const ctx = use(FormFieldContext)
  const linked = ctx !== null && ctx.fieldId === id
  const describedBy = linked
    ? [ctx.hasHint ? ctx.hintId : null, ctx.hasError ? ctx.errorId : null].filter(Boolean).join(' ') || undefined
    : undefined
  return { describedBy, invalid: Boolean(error) || (linked && ctx.hasError) }
}

const controlBase =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-text transition-colors placeholder:text-placeholder focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-text-muted read-only:bg-surface-muted'

// Estados excluyentes (no se suman): dos utilidades de color en el mismo class dejan el ganador al orden del CSS.
const controlValid = 'border-border-strong hover:border-text-muted focus:border-brand-500 focus:ring-brand-500/30'
const controlInvalid = 'border-red-600 hover:border-red-700 focus:border-red-600 focus:ring-red-600/25'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, ...props },
  ref,
) {
  const { describedBy, invalid } = useFieldA11y(id, error)
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className={cn(controlBase, invalid ? controlInvalid : controlValid, className)}
      {...props}
    />
  )
})

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(function PasswordInput(
  { className, error, id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)
  const { describedBy, invalid } = useFieldA11y(id, error)
  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={visible ? 'text' : 'password'}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(controlBase, 'pr-11', invalid ? controlInvalid : controlValid, className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
      >
        {visible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    </div>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, id, rows = 3, ...props },
  ref,
) {
  const { describedBy, invalid } = useFieldA11y(id, error)
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className={cn(controlBase, 'resize-y', invalid ? controlInvalid : controlValid, className)}
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
  const { describedBy, invalid } = useFieldA11y(id, error)
  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(controlBase, 'appearance-none pr-9', invalid ? controlInvalid : controlValid, className)}
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
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  /** Ayuda breve y permanente bajo el control (formato esperado, para qué sirve el dato). */
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  const baseId = useId()
  const ctx: FormFieldContextValue = {
    fieldId: htmlFor,
    hintId: `${baseId}-hint`,
    errorId: `${baseId}-error`,
    hasHint: Boolean(hint),
    hasError: Boolean(error),
  }

  return (
    <FormFieldContext value={ctx}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-text">
          {label}
          {required && (
            <>
              <span className="text-red-700" aria-hidden>
                {' '}
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </>
          )}
        </label>
        {children}
        {hint && (
          <p id={ctx.hintId} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={ctx.errorId} role="alert" className="flex items-start gap-1.5 text-sm text-red-700">
            <WarningCircleIcon size={16} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>
    </FormFieldContext>
  )
}
