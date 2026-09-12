import { ApiError } from '@/types/common'

export function getInstitutionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'INSTITUTION_NAME_ALREADY_EXISTS':
        return 'Ya existe una institución registrada con ese nombre.'
      case 'INSTITUTION_NOT_FOUND':
        return 'La institución ya no existe. Actualiza la lista e intenta nuevamente.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
