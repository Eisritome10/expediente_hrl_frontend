import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/ui/Skeleton'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full min-w-full text-left text-sm">{children}</table>
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

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-surface-muted/60', className)}>{children}</tr>
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
