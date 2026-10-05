import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowElbowDownLeftIcon,
  BuildingsIcon,
  ClipboardTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { Dialog } from '@/components/ui/Dialog'
import { useInstitutionsList } from '@/hooks/useInstitutions'
import { useProtocolsList } from '@/hooks/useProtocols'
import { useResearchersList } from '@/hooks/useResearchers'
import { cn } from '@/lib/cn'
import { NAV_DESTINATIONS, NAV_GROUPS, NAV_HOME, type NavIcon } from '@/lib/navigation'

/** El listado se trae completo una vez y se filtra aquí; el backend todavía no tiene un buscador global. */
const SEARCH_LIMIT = 100
const MAX_PER_GROUP = 5
const MIN_CHARS = 2

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

interface PaletteItem {
  id: string
  group: string
  label: string
  hint?: string
  to: string
  icon: NavIcon
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Buscar en el sistema" className="max-w-xl">
      {open && <PaletteBody onClose={onClose} />}
    </Dialog>
  )
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // showModal() enfoca el primer control del diálogo (el botón de cerrar) después de montar el contenido:
  // el campo se enfoca en el siguiente cuadro para que se pueda escribir de inmediato.
  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])

  // Los tres listados se piden al abrir la búsqueda y quedan en caché para las siguientes veces.
  const protocols = useProtocolsList({ page: 1, limit: SEARCH_LIMIT })
  const researchers = useResearchersList({ page: 1, limit: SEARCH_LIMIT })
  const institutions = useInstitutionsList({ page: 1, limit: SEARCH_LIMIT })

  const term = normalize(query)
  const searching = term.length >= MIN_CHARS
  const loading = searching && (protocols.isPending || researchers.isPending || institutions.isPending)

  const items = useMemo<PaletteItem[]>(() => {
    const sectionItems = [NAV_HOME, ...NAV_DESTINATIONS]
      .filter(
        (destination) =>
          !term ||
          normalize(destination.label).includes(term) ||
          destination.keywords?.some((keyword) => normalize(keyword).includes(term)),
      )
      .map((destination): PaletteItem => {
        const group = NAV_GROUPS.find((item) => item.id === destination.group)
        return {
          id: `section-${destination.to}`,
          group: 'Secciones',
          label: destination.label,
          hint: group && group.id !== 'daily' ? group.title : undefined,
          to: destination.to,
          icon: destination.icon,
        }
      })

    const quickActions: PaletteItem[] =
      !term || normalize('registrar nuevo protocolo').includes(term)
        ? [
            {
              id: 'action-new-protocol',
              group: 'Acciones',
              label: 'Registrar nuevo protocolo',
              to: '/protocolos/nuevo',
              icon: PlusIcon,
            },
          ]
        : []

    if (!searching) return [...quickActions, ...sectionItems]

    const protocolItems = (protocols.data?.data ?? [])
      .filter((protocol) => {
        const principal = `${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}`
        return (
          normalize(protocol.nroExpediente).includes(term) ||
          normalize(protocol.titulo).includes(term) ||
          normalize(principal).includes(term)
        )
      })
      .slice(0, MAX_PER_GROUP)
      .map(
        (protocol): PaletteItem => ({
          id: `protocol-${protocol.id}`,
          group: 'Protocolos',
          label: protocol.nroExpediente,
          hint: protocol.titulo,
          to: `/protocolos/${protocol.id}`,
          icon: ClipboardTextIcon,
        }),
      )

    const researcherItems = (researchers.data?.data ?? [])
      .filter(
        (researcher) =>
          normalize(`${researcher.firstName} ${researcher.lastName}`).includes(term) || normalize(researcher.dni).includes(term),
      )
      .slice(0, MAX_PER_GROUP)
      .map(
        (researcher): PaletteItem => ({
          id: `researcher-${researcher.id}`,
          group: 'Investigadores',
          label: `${researcher.firstName} ${researcher.lastName}`,
          hint: `DNI ${researcher.dni}`,
          to: `/investigadores?q=${encodeURIComponent(researcher.dni)}`,
          icon: UsersIcon,
        }),
      )

    const institutionItems = (institutions.data?.data ?? [])
      .filter(
        (institution) =>
          normalize(institution.name).includes(term) || normalize(institution.abbreviation ?? '').includes(term),
      )
      .slice(0, MAX_PER_GROUP)
      .map(
        (institution): PaletteItem => ({
          id: `institution-${institution.id}`,
          group: 'Instituciones',
          label: institution.name,
          hint: institution.abbreviation ?? undefined,
          to: `/instituciones?q=${encodeURIComponent(institution.name)}`,
          icon: BuildingsIcon,
        }),
      )

    return [...protocolItems, ...researcherItems, ...institutionItems, ...quickActions, ...sectionItems]
  }, [term, searching, protocols.data, researchers.data, institutions.data])

  const safeActive = Math.min(active, Math.max(items.length - 1, 0))

  // El elemento activo siempre queda a la vista al moverse con el teclado.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${safeActive}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [safeActive])

  const go = (item: PaletteItem) => {
    onClose()
    navigate(item.to)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(items.length === 0 ? 0 : (safeActive + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(items.length === 0 ? 0 : (safeActive - 1 + items.length) % items.length)
    } else if (event.key === 'Enter' && items[safeActive]) {
      event.preventDefault()
      go(items[safeActive])
    }
  }

  // Los resultados se muestran agrupados, en el orden en que llegan.
  const groups = items.reduce<{ title: string; entries: { item: PaletteItem; index: number }[] }[]>((acc, item, index) => {
    const last = acc[acc.length - 1]
    if (last && last.title === item.group) last.entries.push({ item, index })
    else acc.push({ title: item.group, entries: [{ item, index }] })
    return acc
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <MagnifyingGlassIcon
          size={18}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={items[safeActive] ? `${listId}-${safeActive}` : undefined}
          aria-label="Buscar protocolos, investigadores, instituciones o secciones"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          placeholder="Expediente, título, nombre, DNI o sección"
          className="w-full rounded-lg border border-border-strong bg-white py-3 pr-3.5 pl-10 text-sm text-text placeholder:text-placeholder focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
        />
      </div>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Resultados"
        className="-mx-1 flex max-h-[min(24rem,50dvh)] flex-col gap-3 overflow-y-auto px-1"
      >
        {groups.map((group) => (
          <li key={group.title} role="presentation" className="flex flex-col gap-1">
            <p className="px-2.5 text-xs font-semibold text-text-muted">{group.title}</p>
            <ul role="group" aria-label={group.title} className="flex flex-col gap-0.5">
              {group.entries.map(({ item, index }) => (
                <li
                  key={item.id}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === safeActive}
                  onMouseMove={() => setActive(index)}
                  onClick={() => go(item)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                    index === safeActive ? 'bg-brand-50 text-brand-900' : 'text-text',
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn('shrink-0', index === safeActive ? 'text-brand-700' : 'text-text-muted')}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.label}</span>
                    {item.hint && <span className="block truncate text-xs text-text-muted">{item.hint}</span>}
                  </span>
                  {index === safeActive && (
                    <ArrowElbowDownLeftIcon size={14} className="shrink-0 text-brand-700" aria-hidden />
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}

        {items.length === 0 && !loading && (
          <li role="presentation" className="px-2.5 py-6 text-center text-sm text-text-muted">
            Sin resultados para «{query.trim()}». Prueba con el número de expediente, el DNI o parte del nombre.
          </li>
        )}
        {loading && (
          <li role="presentation" className="px-2.5 py-2 text-xs text-text-muted" aria-live="polite">
            Buscando en protocolos, investigadores e instituciones...
          </li>
        )}
      </ul>

      <p className="border-t border-border pt-3 text-xs text-text-muted">
        Usa las flechas para moverte, Enter para abrir y Esc para cerrar.
        {searching && ' Se muestran los primeros resultados de cada grupo.'}
      </p>
    </div>
  )
}
