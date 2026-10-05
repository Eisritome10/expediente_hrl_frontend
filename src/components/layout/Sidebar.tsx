import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CaretDownIcon, HospitalIcon, LockKeyIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import {
  NAV_GROUPS,
  NAV_HOME,
  destinationsOf,
  isPathInDestination,
  type NavDestination,
  type NavGroup,
} from '@/lib/navigation'

const CATALOGS_OPEN_KEY = 'hrl.nav.catalogsOpen'

function readStoredOpen(): boolean {
  try {
    return localStorage.getItem(CATALOGS_OPEN_KEY) === '1'
  } catch {
    return false
  }
}

function storeOpen(open: boolean) {
  try {
    localStorage.setItem(CATALOGS_OPEN_KEY, open ? '1' : '0')
  } catch {
    // Sin almacenamiento disponible el menú sigue funcionando; solo no recuerda el estado.
  }
}

function NavItem({ item }: { item: NavDestination }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
          isActive ? 'bg-white/15 font-medium text-white' : 'text-white/85 hover:bg-white/10',
        )
      }
    >
      <item.icon size={18} />
      {item.label}
    </NavLink>
  )
}

function FlatGroup({ group }: { group: NavGroup }) {
  return (
    <section aria-labelledby={`nav-${group.id}`}>
      <h2 id={`nav-${group.id}`} className="px-2.5 pb-2 text-xs font-semibold tracking-wide text-white/60 uppercase">
        {group.title}
      </h2>
      <ul className="space-y-1">
        {destinationsOf(group.id).map((item) => (
          <li key={item.to}>
            <NavItem item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Grupo plegable: se abre solo cuando la persona está dentro de él y recuerda cómo lo dejó. */
function CollapsibleGroup({ group }: { group: NavGroup }) {
  const { pathname } = useLocation()
  const items = destinationsOf(group.id)
  const activeInside = items.some((item) => isPathInDestination(pathname, item))
  const [open, setOpen] = useState(() => readStoredOpen() || activeInside)

  // Si se llega a una sección del grupo (por la búsqueda, un enlace o las migas), el grupo se abre para mostrar dónde está.
  const [wasInside, setWasInside] = useState(activeInside)
  if (wasInside !== activeInside) {
    setWasInside(activeInside)
    if (activeInside) setOpen(true)
  }

  const toggle = () => {
    const next = !open
    setOpen(next)
    storeOpen(next)
  }

  const panelId = `nav-${group.id}-panel`

  return (
    <section>
      <h2 className="text-xs">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 font-semibold tracking-wide text-white/70 uppercase transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="flex items-center gap-2">
            {group.title}
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-normal normal-case">
              {items.length}
            </span>
          </span>
          <CaretDownIcon size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} aria-hidden />
        </button>
      </h2>
      {/* La altura se anima con filas de grid (sin medir): el cambio de estado se ve, y inert saca los enlaces del foco al plegar. */}
      <div
        id={panelId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ul className="min-h-0 space-y-1 overflow-hidden" inert={!open}>
          {items.map((item) => (
            <li key={item.to}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('h-full w-64 shrink-0 flex-col bg-gradient-to-b from-chrome-from to-chrome-to text-white', className)}>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <HospitalIcon size={26} weight="bold" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Hospital Regional</p>
          <p className="text-xs text-white/70">de Loreto</p>
        </div>
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        <NavItem item={NAV_HOME} />
        {NAV_GROUPS.map((group) =>
          group.collapsible ? <CollapsibleGroup key={group.id} group={group} /> : <FlatGroup key={group.id} group={group} />,
        )}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/60">
          <span className="flex items-center gap-2.5">
            <LockKeyIcon size={18} />
            Cambiar contraseña
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">Próximamente</span>
        </div>
      </div>
    </aside>
  )
}
