import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import { useTheme } from '@/lib/theme'

/** Alterna claro y oscuro. `tone="onDark"` es para las cabeceras verdes, donde el botón va en blanco. */
export function ThemeToggle({ tone = 'default', className }: { tone?: 'default' | 'onDark'; className?: string }) {
  const { isDark, toggle } = useTheme()
  const Icon = isDark ? SunIcon : MoonIcon

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none',
        tone === 'onDark' ? 'text-white hover:bg-white/15 focus-visible:ring-white/60' : 'text-text-muted hover:bg-wash hover:text-text',
        className,
      )}
    >
      <Icon size={20} aria-hidden />
    </button>
  )
}
