import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import type { PaginationMeta } from '@/types/common'

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit))
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <p className="text-xs text-text-muted">
        {meta.total === 0 ? 'Sin resultados' : `Mostrando ${from} al ${to} de ${meta.total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="px-2.5 py-1.5"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Página anterior"
        >
          <CaretLeftIcon size={16} />
        </Button>
        <span className="text-xs font-medium text-text">
          Página {meta.page} de {totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          className="px-2.5 py-1.5"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Página siguiente"
        >
          <CaretRightIcon size={16} />
        </Button>
      </div>
    </div>
  )
}
