import type { ReactNode } from 'react'
import { WarningCircleIcon } from '@phosphor-icons/react'

/** Error a nivel de formulario (fallo del servidor). Los errores de campo van en FormField. */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
    >
      <WarningCircleIcon size={18} weight="fill" className="mt-px shrink-0 text-red-600" aria-hidden />
      <span>{children}</span>
    </div>
  )
}
