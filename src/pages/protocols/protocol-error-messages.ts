import { ApiError } from '@/types/common'

export function getProtocolErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.body?.errorCode) {
      case 'PROTOCOL_NRO_EXPEDIENTE_ALREADY_EXISTS':
        return 'Ya existe un protocolo registrado con ese número de expediente.'
      case 'PROTOCOL_NOT_FOUND':
        return 'El protocolo ya no existe. Actualiza la lista e intenta nuevamente.'
      case 'PROTOCOL_NOT_OBSERVED':
        return 'Solo se puede corregir un protocolo que esté observado por el CIC o el CIEI.'
      case 'PROTOCOL_ORIGINAL_NOT_AMENDABLE':
        return 'Solo se puede enmendar un protocolo finalizado.'
      case 'PROTOCOL_INVALID_REFERENCE':
        return 'Alguno de los datos seleccionados (investigador, institución, línea, modalidad o destino) ya no es válido. Vuelve a seleccionarlo.'
      case 'PROTOCOL_INVALID_RESEARCH_LINE':
        return 'La línea de investigación seleccionada no corresponde al tipo esperado.'
      case 'AGREEMENT_NOT_FOUND':
        return 'El convenio seleccionado no existe o fue dado de baja.'
      case 'STUDY_DESIGN_NOT_FOUND':
        return 'Uno de los diseños de estudio seleccionados ya no es válido.'
      case 'PROTOCOLO_INVESTIGADOR_DUPLICADO':
        return 'Un investigador no puede figurar en más de un rol dentro del mismo protocolo.'
      case 'PROTOCOLO_REVISION_HC_INCOMPLETA':
        return 'Completa el monto, tipo y número de comprobante de la revisión de historia clínica.'
      case 'PROTOCOLO_LUGAR_EJECUCION_INCONSISTENTE':
        return 'El lugar de ejecución no puede ser el Hospital Regional si el protocolo no es institucional.'
      case 'PROTOCOLO_MEMOS_NO_APLICABLES':
        return 'Los memos (destinos) no aplican si el protocolo no es institucional.'
      case 'PROTOCOLO_FACULTAD_REQUIERE_UNIVERSIDAD':
        return 'La facultad solo puede asociarse a una institución marcada como universidad.'
      case 'PROTOCOL_REVIEW_INVALID_REVIEWER':
        return 'El usuario revisor no existe o está inactivo. Vuelve a iniciar sesión e intenta nuevamente.'
      case 'PROTOCOL_REVIEW_PROTOCOL_ALREADY_FINALIZED':
        return 'El protocolo ya fue finalizado y no admite nuevos dictámenes.'
      case 'PROTOCOLO_FACULTAD_NO_PERTENECE_INSTITUCION':
        return 'La facultad seleccionada no pertenece a la universidad elegida. Vuelve a seleccionarla.'
      case 'PROTOCOLO_COMPROBANTE_INVALIDO':
        return 'El comprobante no cumple el formato de SUNAT: boleta B001-00001234 o factura F001-00001234 (serie de 4 caracteres y correlativo de hasta 8 dígitos).'
      case 'PROTOCOLO_CONSTANCIA_ETICA_INCOMPLETA':
        return 'Si el protocolo cuenta con constancia ética, completa su N° o código y su fecha.'
      case 'PROTOCOL_REVIEW_OBSERVATIONS_REQUIRED':
        return 'Un dictamen observado necesita al menos una observación, y cada observación debe tener su tipo y su texto.'
      case 'PROTOCOL_REVIEW_CIC_APPROVAL_REQUIRED':
        return 'El Comité de Ética (CIEI) solo puede dictaminar una vez que el Comité de Investigación Clínica (CIC) haya emitido su aprobación.'
      case 'PROTOCOL_REVIEW_COMMITTEE_CLOSED':
        return 'El comité seleccionado ya ha emitido una aprobación definitiva para este protocolo.'
      case 'PROTOCOL_REVIEW_OBSERVATION_PENDING':
        return 'No se puede finalizar el protocolo mientras existan observaciones pendientes del CIEI.'
      case 'PROTOCOL_REVIEW_FINALIZATION_INCOMPLETE':
        return 'Para finalizar, el CIEI debe establecer el nivel de riesgo del protocolo.'
      case 'PROTOCOL_REVIEW_ETHICS_FIELDS_NOT_ALLOWED':
        return 'El nivel de riesgo solo lo establece el Comité de Ética (CIEI).'
      case 'PROTOCOL_REVIEW_CONCURRENT_UPDATE':
        return 'El estado del protocolo cambió recientemente. Actualiza la página e intenta nuevamente.'
      case 'PROTOCOL_REVIEW_INVALID_OUTCOME_FOR_COMMITTEE':
        return 'El resultado seleccionado no es válido para el comité seleccionado.'
      case 'RESEARCHER_ACCOUNT_NOT_LINKED':
        return 'Tu cuenta aún no está vinculada a un investigador. Comunícate con la OADI para que la vinculen.'
      default:
        return error.message || 'No se pudo completar la operación.'
    }
  }
  return 'No se pudo conectar con el servidor. Intenta nuevamente.'
}
