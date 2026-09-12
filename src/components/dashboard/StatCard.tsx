import type { ComponentType } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value?: number
  loading?: boolean
  error?: boolean
  icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
  tone?: 'brand' | 'neutral' | 'warning'
  isMock?: boolean
}

const toneClasses = {
  brand: 'bg-brand-50 text-brand-700',
  neutral: 'bg-black/5 text-text-muted',
  warning: 'bg-amber-50 text-amber-700',
}

export function StatCard({ label, value, loading, error, icon: Icon, tone = 'brand', isMock }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
        <Icon size={22} weight="bold" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-medium text-text-muted">{label}</p>
          {isMock && <Badge tone="warning">mock</Badge>}
        </div>
        {loading ? (
          <Skeleton className="mt-1.5 h-6 w-16" />
        ) : error ? (
          <p className="mt-0.5 text-sm font-medium text-red-600">No disponible</p>
        ) : (
          <p className="mt-0.5 text-2xl font-semibold text-text">{value?.toLocaleString('es-PE') ?? '—'}</p>
        )}
      </div>
    </Card>
  )
}
