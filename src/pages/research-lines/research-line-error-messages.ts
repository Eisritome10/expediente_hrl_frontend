import { ApiError } from '@/types/common'

export function getResearchLineErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'RESEARCH_LINE_NAME_AND_TYPE_ALREADY_EXISTS':
        return 'Ya existe una línea de investigación con ese nombre y tipo.'
      case 'RESEARCH_LINE_NOT_FOUND':
        return 'La línea de investigación ya no existe. Actualiza la lista e intenta nuevamente.'
      case 'RESEARCH_LINE_IN_USE_BY_PROTOCOL':
        return 'No se puede eliminar la línea porque está asociada a uno o más protocolos.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
