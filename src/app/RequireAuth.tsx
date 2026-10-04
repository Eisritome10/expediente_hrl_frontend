import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { homePathForRole } from '@/lib/role-home'
import type { UserRole } from '@/types/auth'

/**
 * Exige sesión y, si se indica `roles`, que el rol de la sesión esté permitido.
 * Un rol no permitido no ve un error: vuelve a su propia pantalla de inicio.
 */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return children
}
