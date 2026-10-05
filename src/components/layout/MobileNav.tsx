import { useEffect, useRef } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { Sidebar } from '@/components/layout/Sidebar'

/**
 * Menú lateral como cajón en pantallas angostas. Usa un <dialog> modal: el navegador se encarga del foco,
 * de Esc y de dejar inerte el resto de la página.
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        // Un toque en el fondo oscuro cierra el cajón.
        if (event.target === ref.current) onClose()
      }}
      aria-label="Menú principal"
      className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-transparent p-0 backdrop:bg-ink/55 backdrop:backdrop-blur-[2px] open:flex open:animate-[drawer-in_220ms_cubic-bezier(0.16,1,0.3,1)] lg:hidden"
    >
      <div
        className="relative flex h-full w-full"
        onClick={(event) => {
          // Elegir una sección cierra el cajón.
          if ((event.target as HTMLElement).closest('a')) onClose()
        }}
      >
        <Sidebar className="flex w-full" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="absolute top-4 right-3 flex size-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
        >
          <XIcon size={20} aria-hidden />
        </button>
      </div>
    </dialog>
  )
}
