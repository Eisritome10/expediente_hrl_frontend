import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'brand' | 'neutral' | 'warning'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  neutral: 'bg-black/5 text-text-muted',
  warning: 'bg-amber-50 text-amber-700',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  )
}

export function MockDataNote({ children = 'Datos de ejemplo — módulo pendiente de backend' }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
      <span className="size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
      {children}
    </div>
  )
}
