import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'danger'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone
}

const toneClasses: Record<Tone, string> = {
  neutral: 'text-text-muted hover:bg-surface-muted hover:text-text focus-visible:ring-brand-500/50',
  danger: 'text-text-muted hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-500/50',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, tone = 'neutral', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'rounded-md p-1.5 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
})
