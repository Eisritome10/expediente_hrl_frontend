import { ApiError } from '@/types/common'

export function getResearcherErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'RESEARCHER_DNI_ALREADY_EXISTS':
        return 'Ya existe un investigador registrado con ese DNI.'
      case 'RESEARCHER_EMAIL_ALREADY_EXISTS':
        return 'Ya existe un investigador registrado con ese correo.'
      case 'USER_USERNAME_ALREADY_EXISTS':
        return 'Ya existe una cuenta de acceso con ese usuario. El DNI del investigador se usa como usuario y ya está en uso.'
      case 'USER_EMAIL_ALREADY_EXISTS':
        return 'Ya existe una cuenta de acceso con ese correo electrónico.'
      case 'RESEARCHER_NOT_FOUND':
        return 'El investigador ya no existe. Actualiza la lista e intenta nuevamente.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
