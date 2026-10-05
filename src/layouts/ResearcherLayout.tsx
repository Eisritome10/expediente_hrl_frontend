import { Outlet } from 'react-router-dom'
import { HospitalIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

/** Marco del investigador: una sola pantalla de consulta, sin menú lateral. */
export function ResearcherLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <header className="bg-gradient-to-r from-chrome-from to-chrome-to text-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <HospitalIcon size={26} weight="bold" className="shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">Hospital Regional de Loreto</p>
              <p className="truncate text-xs text-white/80">OADI, seguimiento de protocolos</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <span className="hidden items-center gap-1.5 px-2 text-sm text-white/90 sm:flex">
              <UserCircleIcon size={20} aria-hidden />
              {user?.username}
            </span>
            <ThemeToggle tone="onDark" />
            <button
              type="button"
              onClick={logout}
              aria-label="Cerrar sesión"
              className="flex h-10 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none sm:px-3"
            >
              <SignOutIcon size={18} aria-hidden />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
