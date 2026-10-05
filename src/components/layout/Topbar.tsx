import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SignOutIcon, CaretDownIcon, CaretRightIcon, MagnifyingGlassIcon, UserCircleIcon } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { getBreadcrumbs } from '@/lib/navigation'

export function Topbar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const crumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-white px-6">
      <nav aria-label="Ubicación" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 && <CaretRightIcon size={12} className="shrink-0 text-text-muted" aria-hidden />}
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} className="truncate text-text-muted transition-colors hover:text-brand-700 hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={isLast ? 'truncate font-semibold text-text' : 'truncate text-text-muted'}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Buscar en el sistema"
          aria-keyshortcuts="Control+K"
          className="flex w-60 items-center gap-2.5 rounded-lg border border-border-strong bg-white px-3 py-2 text-sm text-text-muted transition-colors hover:border-text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none lg:w-72"
        >
          <MagnifyingGlassIcon size={16} aria-hidden />
          <span className="flex-1 text-left">Buscar</span>
          <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-sans text-[11px] text-text-muted">
            Ctrl K
          </kbd>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-text transition-colors hover:bg-surface-muted"
          >
            <UserCircleIcon size={22} />
            <span className="font-medium">{user?.username}</span>
            <CaretDownIcon size={14} />
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-border bg-white py-1 shadow-lg">
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-text transition-colors hover:bg-surface-muted"
              >
                <SignOutIcon size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
