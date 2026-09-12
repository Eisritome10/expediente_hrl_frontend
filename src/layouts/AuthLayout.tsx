import { Outlet } from 'react-router-dom'
import { HospitalIcon } from '@phosphor-icons/react'

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-700 via-brand-600 to-brand-300 p-4">
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
