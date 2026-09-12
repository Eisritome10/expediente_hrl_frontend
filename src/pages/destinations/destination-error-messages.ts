import { ApiError } from '@/types/common'

export function getDestinationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'DESTINATION_DESCRIPTION_ALREADY_EXISTS':
        return 'Ya existe un destino registrado con esa descripción.'
      case 'DESTINATION_NOT_FOUND':
        return 'El destino ya no existe. Actualiza la lista e intenta nuevamente.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
