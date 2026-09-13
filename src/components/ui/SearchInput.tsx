import { forwardRef, type InputHTMLAttributes } from 'react'
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, value, onClear, ...props },
  ref,
) {
  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <MagnifyingGlassIcon
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
      />
      <input
        ref={ref}
        type="text"
        value={value}
        className="w-full rounded-lg border border-border bg-white py-2.5 pr-9 pl-9 text-sm text-text placeholder:text-text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
        {...props}
      />
      {onClear && typeof value === 'string' && value.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpiar búsqueda"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-0.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  )
})
