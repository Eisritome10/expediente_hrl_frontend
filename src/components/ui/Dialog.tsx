import { useEffect, useRef, type ReactNode } from 'react'
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
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className={cn(
        'm-auto w-full max-w-md rounded-2xl border border-border bg-white p-0 shadow-2xl shadow-brand-900/15 backdrop:bg-brand-900/30 backdrop:backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          <XIcon size={18} />
        </button>
      </div>

      <div className="px-5 py-4">{children}</div>

      {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
    </dialog>
  )
}
