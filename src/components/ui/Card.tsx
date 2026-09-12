import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-white shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  icon,
  action,
}: {
  title: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-t-xl bg-brand-600 px-5 py-3.5 text-white">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
      </div>
      {action}
    </div>
  )
}
