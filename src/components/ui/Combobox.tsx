import { useMemo, useState } from 'react'
import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { cn } from '@/lib/cn'

export interface ComboboxOption {
  id: string
  label: string
  meta?: string
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  loading?: boolean
  error?: string
  disabled?: boolean
  emptyMessage?: string
  /** Used in the modal title ("Seleccionar {label}"). */
  label?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  loading = false,
  error,
  disabled = false,
  emptyMessage = 'Sin resultados.',
  label,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((option) => option.id === value) ?? null

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query)
    if (!normalizedQuery) return options
    return options.filter(
      (option) =>
        normalize(option.label).includes(normalizedQuery) || normalize(option.meta ?? '').includes(normalizedQuery),
    )
  }, [options, query])

  const closeModal = () => {
    setOpen(false)
    setQuery('')
  }

  const select = (id: string) => {
    onChange(id)
    closeModal()
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3.5 py-2.5 text-left text-sm text-text transition focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-muted',
          error && 'border-red-400',
        )}
      >
        <span className={cn('truncate', !selected && 'text-text-muted')}>{selected ? selected.label : placeholder}</span>
        <CaretDownIcon size={14} className="shrink-0 text-text-muted" />
      </button>

      <Dialog
        open={open}
        onClose={closeModal}
        title={label ? `Seleccionar ${label}` : 'Seleccionar una opción'}
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <MagnifyingGlassIcon
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
            />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-lg border border-border bg-white py-2.5 pr-3 pl-9 text-sm text-text placeholder:text-text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
            />
          </div>

          {selected && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-brand-50 px-3.5 py-2.5">
              <span className="text-sm font-medium text-brand-700">{selected.label}</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
              >
                <XIcon size={12} />
                Quitar
              </button>
            </div>
          )}

          <ul className="max-h-72 overflow-y-auto rounded-lg border border-border">
            {loading ? (
              <li className="px-3.5 py-2 text-sm text-text-muted">Cargando...</li>
            ) : filtered.length === 0 ? (
              <li className="px-3.5 py-2 text-sm text-text-muted">{emptyMessage}</li>
            ) : (
              filtered.map((option) => (
                <li key={option.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => select(option.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition hover:bg-surface-muted',
                      option.id === value ? 'font-medium text-brand-700' : 'text-text',
                    )}
                  >
                    <span className="truncate">
                      {option.label}
                      {option.meta && <span className="ml-1.5 text-xs text-text-muted">{option.meta}</span>}
                    </span>
                    {option.id === value && <CheckIcon size={14} className="shrink-0 text-brand-600" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </Dialog>
    </>
  )
}
