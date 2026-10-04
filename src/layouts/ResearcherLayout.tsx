import { Outlet } from 'react-router-dom'
import { HospitalIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'

/** Marco del investigador: una sola pantalla de consulta, sin menú lateral. */
export function ResearcherLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <header className="bg-gradient-to-r from-brand-700 to-brand-900 text-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <HospitalIcon size={26} weight="bold" className="shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">Hospital Regional de Loreto</p>
              <p className="truncate text-xs text-brand-100">OADI, seguimiento de protocolos</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden items-center gap-1.5 px-2 text-sm text-brand-50 sm:flex">
              <UserCircleIcon size={20} aria-hidden />
              {user?.username}
            </span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-white"
            >
              <SignOutIcon size={18} aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
