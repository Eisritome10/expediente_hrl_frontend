import { useEffect, useId, useRef, type ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'
import gsap from 'gsap'
import { cn } from '@/lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      gsap.fromTo(dialog, { opacity: 0, scale: 0.97, y: 6 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power2.out' })
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      // `close`/`cancel` burbujean por el árbol de React: sin esto, cerrar un diálogo anidado
      // (p. ej. el selector de un Combobox) cerraría también el diálogo que lo contiene.
      onClose={(event) => {
        event.stopPropagation()
        onClose()
      }}
      onCancel={(event) => {
        event.stopPropagation()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      aria-labelledby={titleId}
      className={cn(
        // `open:flex` (no `flex` suelto): el display del <dialog> cerrado debe seguir siendo none.
        'm-auto w-full max-w-md rounded-2xl border border-border bg-white p-0 shadow-2xl shadow-brand-900/15 backdrop:bg-brand-900/30 backdrop:backdrop-blur-[2px] open:flex open:max-h-[calc(100dvh-2rem)] open:flex-col',
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 id={titleId} className="text-base font-semibold text-text">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          <XIcon size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

      {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
    </dialog>
  )
}
