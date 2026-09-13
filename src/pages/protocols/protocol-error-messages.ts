import { ApiError } from '@/types/common'

export function getProtocolErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'PROTOCOL_NRO_EXPEDIENTE_ALREADY_EXISTS':
        return 'Ya existe un protocolo registrado con ese número de expediente.'
      case 'PROTOCOL_NOT_FOUND':
        return 'El protocolo ya no existe. Actualiza la lista e intenta nuevamente.'
      case 'PROTOCOL_INVALID_REFERENCE':
        return 'Alguno de los datos seleccionados (investigador, institución, línea, modalidad o destino) ya no es válido. Vuelve a seleccionarlo.'
      case 'PROTOCOL_INVALID_RESEARCH_LINE':
        return 'La línea de investigación seleccionada no corresponde al tipo esperado.'
      case 'PROTOCOLO_CONVENIO_SIN_NOMBRE':
        return 'Ingresa el nombre de la institución del convenio.'
      case 'PROTOCOLO_REVISION_HC_INCOMPLETA':
        return 'Completa el monto, tipo y número de comprobante de la revisión de historia clínica.'
      case 'PROTOCOLO_LUGAR_EJECUCION_INCONSISTENTE':
        return 'El lugar de ejecución no puede ser el Hospital Regional si el protocolo no es institucional.'
      case 'PROTOCOLO_MEMOS_NO_APLICABLES':
        return 'Los memos (destinos) no aplican si el protocolo no es institucional.'
      case 'PROTOCOLO_FACULTAD_REQUIERE_UNIVERSIDAD':
        return 'La facultad solo puede asociarse a una institución marcada como universidad.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
