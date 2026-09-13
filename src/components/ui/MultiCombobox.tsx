import { useMemo, useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { cn } from '@/lib/cn'
import type { ComboboxOption } from '@/components/ui/Combobox'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

interface MultiComboboxProps {
  options: ComboboxOption[]
  value: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  loading?: boolean
  emptyMessage?: string
  disabled?: boolean
  /** Used in the modal title ("Agregar {label}") and as an accessible name for the trigger. */
  label?: string
}

export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = 'Agregar...',
  loading = false,
  emptyMessage = 'Sin resultados.',
  disabled = false,
  label,
}: MultiComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedOptions = useMemo(
    () => value.map((id) => options.find((option) => option.id === id)).filter((o): o is ComboboxOption => Boolean(o)),
    [options, value],
  )

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query)
    const available = options.filter((option) => !value.includes(option.id))
    if (!normalizedQuery) return available
    return available.filter(
      (option) =>
        normalize(option.label).includes(normalizedQuery) || normalize(option.meta ?? '').includes(normalizedQuery),
    )
  }, [options, value, query])

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((existing) => existing !== id) : [...value, id])
  }

  const closeModal = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <div
        onClick={() => !disabled && setOpen(true)}
        className={cn(
          'flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-2 text-sm transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/40',
          disabled ? 'cursor-not-allowed bg-surface-muted opacity-70' : 'cursor-pointer hover:border-brand-300',
        )}
      >
        {selectedOptions.map((option) => (
          <span
            key={option.id}
            className="flex items-center gap-1.5 rounded-md bg-brand-50 py-1 pr-1.5 pl-2.5 text-xs font-medium text-brand-700"
          >
            {option.label}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                toggle(option.id)
              }}
              aria-label={`Quitar ${option.label}`}
              className="rounded-full p-0.5 transition-colors hover:bg-brand-100"
            >
              <XIcon size={12} />
            </button>
          </span>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation()
            if (!disabled) setOpen(true)
          }}
          className="flex items-center gap-1 py-0.5 text-sm text-text-muted outline-none disabled:cursor-not-allowed"
        >
          <PlusIcon size={13} />
          {selectedOptions.length === 0 ? placeholder : 'Agregar'}
        </button>
      </div>

      <Dialog
        open={open}
        onClose={closeModal}
        title={label ? `Agregar ${label}` : 'Agregar elementos'}
        footer={
          <Button type="button" onClick={closeModal}>
            Listo
          </Button>
        }
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

          {selectedOptions.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-text-muted uppercase">
                Seleccionados ({selectedOptions.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedOptions.map((option) => (
                  <span
                    key={option.id}
                    className="flex items-center gap-1.5 rounded-md bg-brand-50 py-1 pr-1.5 pl-2.5 text-xs font-medium text-brand-700"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={() => toggle(option.id)}
                      aria-label={`Quitar ${option.label}`}
                      className="rounded-full p-0.5 transition-colors hover:bg-brand-100"
                    >
                      <XIcon size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-medium text-text-muted uppercase">Disponibles</p>
            <ul className="max-h-64 overflow-y-auto rounded-lg border border-border">
              {loading ? (
                <li className="px-3.5 py-2 text-sm text-text-muted">Cargando...</li>
              ) : filtered.length === 0 ? (
                <li className="px-3.5 py-2 text-sm text-text-muted">{emptyMessage}</li>
              ) : (
                filtered.map((option) => (
                  <li key={option.id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggle(option.id)}
                      className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm text-text transition hover:bg-surface-muted"
                    >
                      <span className="truncate">
                        {option.label}
                        {option.meta && <span className="ml-1.5 text-xs text-text-muted">{option.meta}</span>}
                      </span>
                      <PlusIcon size={14} className="shrink-0 text-brand-600" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </Dialog>
    </>
  )
}
