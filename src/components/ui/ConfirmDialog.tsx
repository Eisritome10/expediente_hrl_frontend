import type { ReactNode } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Eliminar',
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel?: string
  loading?: boolean
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            loading={loading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/60"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted">{description}</p>
    </Dialog>
  )
}
