import { ApiError } from '@/types/common'

export function getAgreementErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'AGREEMENT_NAME_ALREADY_EXISTS':
        return 'Ya existe un convenio registrado con ese nombre.'
      case 'AGREEMENT_NOT_FOUND':
        return 'El convenio ya no existe. Actualiza la lista e intenta nuevamente.'
      case 'AGREEMENT_IN_USE_BY_PROTOCOL':
        return 'No se puede eliminar el convenio porque está asociado a uno o más protocolos.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
