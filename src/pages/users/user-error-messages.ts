import { ApiError } from '@/types/common'

export function getUserErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'USER_USERNAME_ALREADY_EXISTS':
        return 'Ya existe un usuario registrado con ese nombre de usuario.'
      case 'USER_EMAIL_ALREADY_EXISTS':
        return 'Ya existe un usuario registrado con ese correo electrónico.'
      case 'USER_NOT_FOUND':
        return 'El usuario ya no existe. Actualiza la lista e intenta nuevamente.'
      case 'USER_MANAGED_BY_RESEARCHER':
        return 'Esta cuenta pertenece a un investigador; gestiónala desde el módulo de investigadores.'
      case 'USER_IN_USE_BY_PROTOCOL_REVIEW':
        return 'No se puede eliminar el usuario porque figura como revisor en uno o más dictámenes de protocolo.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
