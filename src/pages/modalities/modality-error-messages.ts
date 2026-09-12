import { ApiError } from '@/types/common'

export function getModalityErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'MODALITY_NAME_ALREADY_EXISTS':
        return 'Ya existe una modalidad registrada con ese nombre.'
      case 'MODALITY_NOT_FOUND':
        return 'La modalidad ya no existe. Actualiza la lista e intenta nuevamente.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
