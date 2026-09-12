import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import {
  SquaresFourIcon,
  UsersIcon,
  BuildingsIcon,
  GraduationCapIcon,
  PaperPlaneTiltIcon,
  FlaskIcon,
  UserGearIcon,
  LockKeyIcon,
  HospitalIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

interface NavItem {
  label: string
  to?: string
  icon: ComponentType<{ size?: number; weight?: 'regular' | 'bold' }>
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const sections: NavSection[] = [
  { items: [{ label: 'Dashboard', to: '/', icon: SquaresFourIcon }] },
  {
    title: 'Archivos y Catálogos',
    items: [
      { label: 'Investigadores', to: '/investigadores', icon: UsersIcon },
      { label: 'Instituciones', to: '/instituciones', icon: BuildingsIcon },
      { label: 'Facultades', icon: GraduationCapIcon },
      { label: 'Destinos', icon: PaperPlaneTiltIcon },
      { label: 'Modalidades', icon: FlaskIcon },
      { label: 'Usuarios', icon: UserGearIcon },
    ],
  },
  {
    title: 'Seguridad',
    items: [{ label: 'Cambiar Contraseña', icon: LockKeyIcon }],
  },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-gradient-to-b from-brand-700 to-brand-900 text-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <HospitalIcon size={26} weight="bold" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Hospital Regional</p>
          <p className="text-xs text-brand-100/70">de Loreto</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {sections.map((section) => (
          <div key={section.title ?? 'main'}>
            {section.title && (
              <p className="px-2.5 pb-2 text-xs font-semibold tracking-wide text-brand-100/60 uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.label}>
                  {item.to ? (
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition',
                          isActive
                            ? 'bg-white/15 font-medium text-white'
                            : 'text-brand-50/85 hover:bg-white/10',
                        )
                      }
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  ) : (
                    <div className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-sm text-brand-50/45">
                      <span className="flex items-center gap-2.5">
                        <item.icon size={18} />
                        {item.label}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">Próximamente</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
