import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * En pantallas angostas cada fila pasa a ser una tarjeta apilada (ver `.responsive-table` en index.css).
 * Cada celda recibe como etiqueta el texto de su columna, para que se lea "Expediente: 123" y no un valor suelto.
 */
export function Table({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLTableElement>(null)

  useLayoutEffect(() => {
    const table = ref.current
    if (!table) return
    const labels = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent?.trim() ?? '')
    table.querySelectorAll('tbody tr').forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        // La columna de acciones (iconos) no necesita etiqueta: se alinea a la derecha de la tarjeta.
        const label = labels[index]
        if (label && label.toLowerCase() !== 'acciones') cell.setAttribute('data-label', label)
      })
    })
  })

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm shadow-black/[0.03]">
      <table ref={ref} className="responsive-table w-full min-w-full text-left text-sm">
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border bg-surface-muted text-xs font-semibold tracking-wide text-text-muted uppercase">
      <tr>{children}</tr>
    </thead>
  )
}

export function TableTh({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('px-4 py-3 font-semibold', className)} {...props} />
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function TableRow({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('transition-colors hover:bg-surface-muted/60', className)} {...props}>
      {children}
    </tr>
  )
}

export function TableTd({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 text-text', className)} {...props} />
}

export function TableSkeletonRows({ rows, columns }: { rows: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <TableTd key={colIndex}>
              <Skeleton className="h-4 w-full max-w-32" />
            </TableTd>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function TableEmptyState({ colSpan, message, action }: { colSpan: number; message: string; action?: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <p className="text-sm text-text-muted">{message}</p>
        {action && <div className="mt-3 flex justify-center">{action}</div>}
      </td>
    </tr>
  )
}
