import type { ComponentType } from 'react'
import {
  SquaresFourIcon,
  ClipboardTextIcon,
  UsersIcon,
  BuildingsIcon,
  PaperPlaneTiltIcon,
  FlaskIcon,
  MicroscopeIcon,
  HandshakeIcon,
  TreeStructureIcon,
  UserGearIcon,
} from '@phosphor-icons/react'

export type NavIcon = ComponentType<{ size?: number; weight?: 'regular' | 'bold'; className?: string }>

export type NavGroupId = 'daily' | 'people' | 'catalogs'

export interface NavDestination {
  label: string
  to: string
  icon: NavIcon
  group: NavGroupId | null
  /** Palabras con las que también se debe encontrar la sección en la búsqueda. */
  keywords?: string[]
}

export interface NavGroup {
  id: NavGroupId
  title: string
  /** Los catálogos se editan poco: arrancan plegados para no competir con el trabajo diario. */
  collapsible: boolean
}

/** Fuente única del menú lateral, las migas de pan y la búsqueda global. */
export const NAV_GROUPS: NavGroup[] = [
  { id: 'daily', title: 'Trabajo diario', collapsible: false },
  { id: 'people', title: 'Personas e instituciones', collapsible: false },
  { id: 'catalogs', title: 'Catálogos', collapsible: true },
]

export const NAV_HOME: NavDestination = { label: 'Inicio', to: '/', icon: SquaresFourIcon, group: null, keywords: ['dashboard', 'resumen'] }

export const NAV_DESTINATIONS: NavDestination[] = [
  { label: 'Protocolos', to: '/protocolos', icon: ClipboardTextIcon, group: 'daily', keywords: ['expediente', 'dictamen', 'revision'] },
  { label: 'Investigadores', to: '/investigadores', icon: UsersIcon, group: 'people', keywords: ['dni', 'coinvestigador', 'asesor'] },
  { label: 'Instituciones', to: '/instituciones', icon: BuildingsIcon, group: 'people', keywords: ['universidad', 'hospital', 'facultad', 'facultades'] },
  { label: 'Usuarios', to: '/usuarios', icon: UserGearIcon, group: 'people', keywords: ['cuentas', 'roles', 'acceso'] },
  { label: 'Destinos', to: '/destinos', icon: PaperPlaneTiltIcon, group: 'catalogs' },
  { label: 'Modalidades', to: '/modalidades', icon: FlaskIcon, group: 'catalogs', keywords: ['pregrado', 'posgrado', 'tarifa'] },
  { label: 'Diseños de estudio', to: '/disenos-estudio', icon: MicroscopeIcon, group: 'catalogs', keywords: ['metodologia'] },
  { label: 'Convenios', to: '/convenios', icon: HandshakeIcon, group: 'catalogs', keywords: ['exoneracion'] },
  { label: 'Líneas de investigación', to: '/lineas-investigacion', icon: TreeStructureIcon, group: 'catalogs', keywords: ['meta 2030', 'hrl'] },
]

export function destinationsOf(group: NavGroupId): NavDestination[] {
  return NAV_DESTINATIONS.filter((destination) => destination.group === group)
}

export function isPathInDestination(pathname: string, destination: NavDestination): boolean {
  return pathname === destination.to || pathname.startsWith(`${destination.to}/`)
}

export interface Crumb {
  label: string
  /** Sin `to`, la miga es solo contexto (por ejemplo el grupo del menú). */
  to?: string
}

/** Dónde está la persona: grupo del menú, sección y, si aplica, la pantalla dentro de la sección. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === '/') return [{ label: NAV_HOME.label }]

  const destination = NAV_DESTINATIONS.find((item) => isPathInDestination(pathname, item))
  if (!destination) return [{ label: NAV_HOME.label, to: '/' }]

  const group = NAV_GROUPS.find((item) => item.id === destination.group)
  const crumbs: Crumb[] = []
  if (group && group.id !== 'daily') crumbs.push({ label: group.title })

  const detail = pathname === '/protocolos/nuevo' ? 'Nuevo protocolo' : pathname !== destination.to ? 'Detalle' : null
  crumbs.push(detail ? { label: destination.label, to: destination.to } : { label: destination.label })
  if (detail) crumbs.push({ label: detail })
  return crumbs
}
