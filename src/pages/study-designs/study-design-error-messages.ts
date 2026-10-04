import { ApiError } from '@/types/common'

export function getStudyDesignErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'STUDY_DESIGN_NAME_ALREADY_EXISTS':
        return 'Ya existe un diseño de estudio registrado con ese nombre.'
      case 'STUDY_DESIGN_NOT_FOUND':
        return 'El diseño de estudio ya no existe. Actualiza la lista e intenta nuevamente.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
