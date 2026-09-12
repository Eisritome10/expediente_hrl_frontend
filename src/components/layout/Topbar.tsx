import { useState } from 'react'
import { SignOutIcon, CaretDownIcon, UserCircleIcon } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'

export function Topbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <div>
        <h1 className="text-sm font-semibold text-text">OADI · Seguimiento de Protocolos de Investigación</h1>
        <p className="text-xs text-text-muted">Hospital Regional de Loreto</p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-text hover:bg-surface-muted"
        >
          <UserCircleIcon size={22} />
          <span className="font-medium">{user?.username}</span>
          <CaretDownIcon size={14} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-border bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-text hover:bg-surface-muted"
            >
              <SignOutIcon size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
