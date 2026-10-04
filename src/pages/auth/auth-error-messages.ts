import { ApiError } from '@/types/common'

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'INVALID_CREDENTIALS':
        return 'Credenciales incorrectas. Verifica tu usuario, DNI o correo y tu contraseña.'
      case 'USER_INACTIVE':
        return 'Tu cuenta está inactiva. Contacta al administrador del sistema.'
      default:
        return error.message || 'No se pudo iniciar sesión. Intenta nuevamente.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
