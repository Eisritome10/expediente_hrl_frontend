import { ApiError } from '@/types/common'

export function getFacultyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'FACULTY_NAME_ALREADY_EXISTS':
        return 'Ya existe una facultad registrada con ese nombre.'
      case 'FACULTY_NOT_FOUND':
        return 'La facultad ya no existe. Actualiza la lista e intenta nuevamente.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
