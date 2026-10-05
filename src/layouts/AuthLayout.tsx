import { Outlet } from 'react-router-dom'
import { HospitalIcon } from '@phosphor-icons/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-br from-chrome-from via-chrome-mid to-chrome-end p-4">
      <ThemeToggle tone="onDark" className="absolute top-3 right-3" />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-white">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/15">
            <HospitalIcon size={26} weight="bold" />
          </div>
          <p className="text-center text-sm font-medium">
            Hospital Regional de Loreto
            <br />
            <span className="text-white/70">OADI · Seguimiento de Protocolos de Investigación</span>
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
