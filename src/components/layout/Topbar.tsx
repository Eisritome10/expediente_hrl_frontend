import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ListIcon, SignOutIcon, CaretDownIcon, CaretRightIcon, MagnifyingGlassIcon, UserCircleIcon } from '@phosphor-icons/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { getBreadcrumbs } from '@/lib/navigation'

export function Topbar({ onOpenSearch, onOpenNav }: { onOpenSearch: () => void; onOpenNav: () => void }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const crumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-3 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Abrir menú"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-text transition-colors hover:bg-wash focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none lg:hidden"
        >
          <ListIcon size={22} aria-hidden />
        </button>
        <nav aria-label="Ubicación" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={`${crumb.label}-${index}`} className={isLast ? 'flex min-w-0 items-center gap-1.5' : 'hidden min-w-0 items-center gap-1.5 sm:flex'}>
                {index > 0 && <CaretRightIcon size={12} className="hidden shrink-0 text-text-muted sm:block" aria-hidden />}
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
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Buscar en el sistema"
          aria-keyshortcuts="Control+K"
          className="flex size-10 items-center justify-center gap-2.5 rounded-lg border border-border-strong bg-surface text-sm text-text-muted transition-colors hover:border-text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none sm:w-60 sm:justify-start sm:px-3 lg:w-72"
        >
          <MagnifyingGlassIcon size={16} aria-hidden />
          <span className="hidden flex-1 text-left sm:block">Buscar</span>
          <kbd className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 font-sans text-[11px] text-text-muted">
            Ctrl K
          </kbd>
        </button>

        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex h-10 items-center gap-2 rounded-lg px-2 text-sm text-text transition-colors hover:bg-surface-muted sm:px-2.5"
          >
            <UserCircleIcon size={22} />
            <span className="hidden font-medium sm:inline">{user?.username}</span>
            <CaretDownIcon size={14} className="hidden sm:block" />
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
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
