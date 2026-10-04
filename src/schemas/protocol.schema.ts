import { z } from 'zod'
import { NRO_EXPEDIENTE_PATTERN, comprobanteError } from '@/lib/comprobante'
import type { Protocol } from '@/types/entities'

export function normalizeAlnum(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export const protocolFormSchema = z
  .object({
    nroExpediente: z
      .string()
      .trim()
      .min(1, 'Ingresa el número de expediente.')
      .regex(NRO_EXPEDIENTE_PATTERN, 'Usa el formato 1234/123456: solo números, una barra y hasta 4 y 6 dígitos.'),
    fechaRecepcion: z.string().min(1, 'Selecciona la fecha de recepción.'),
    titulo: z
      .string()
      .trim()
      .min(1, 'Ingresa el título del proyecto.')
      .max(500, 'Máximo 500 caracteres.'),
    lugarEjecucion: z
      .string()
      .trim()
      .min(1, 'Ingresa el lugar de ejecución.')
      .max(255, 'Máximo 255 caracteres.'),
    esInstitucional: z.boolean(),

    investigadorPrincipalId: z.string().min(1, 'Selecciona un investigador principal.'),
    coinvestigadorIds: z.array(z.string()),
    asesorIds: z.array(z.string()),
    lineaHrlId: z.string().min(1, 'Selecciona una línea de investigación HRL.'),
    lineaMeta2030Id: z.string().min(1, 'Selecciona una línea Meta 2030.'),

    institucionId: z.string(),
    facultadId: z.string(),
    destinoIds: z.array(z.string()),
    studyDesignIds: z.array(z.string()).min(1, 'Selecciona al menos un diseño de estudio.'),
    modalidadId: z.string().min(1, 'Selecciona una modalidad.'),

    esEnmienda: z.boolean(),
    protocoloOriginalId: z.string(),
    esConvenio: z.boolean(),
    convenioId: z.string(),
    pagoRevision: z.number().optional(),
    tipoComprobante: z.string(),
    comprobanteRevision: z.string(),

    requiereRevisionHc: z.boolean(),
    montoHc: z.number().optional(),
    tipoComprobanteHc: z.string(),
    nroComprobanteHc: z.string(),

    tieneConstanciaEtica: z.boolean(),
    idConstanciaEtica: z.string(),
    fechaConstancia: z.string(),
    consentimientoInformado: z.boolean(),
    departamentoDirigidoPermiso: z.string().max(200, 'Máximo 200 caracteres.'),
    certificadoBuenasPracticas: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.esEnmienda && !values.protocoloOriginalId) {
      ctx.addIssue({
        code: 'custom',
        path: ['protocoloOriginalId'],
        message: 'Selecciona el protocolo original.',
      })
    }

    if (!values.esInstitucional && normalizeAlnum(values.lugarEjecucion).includes('hospitalregional')) {
      ctx.addIssue({
        code: 'custom',
        path: ['lugarEjecucion'],
        message: 'No puede ser el Hospital Regional (ni variantes) si el protocolo no es institucional.',
      })
    }

    if (!values.esInstitucional && values.destinoIds.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['destinoIds'],
        message: 'Los memorandos/destinos solo aplican a protocolos institucionales.',
      })
    }

    if (values.coinvestigadorIds.includes(values.investigadorPrincipalId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['coinvestigadorIds'],
        message: 'Ya es el investigador principal, no puede repetirse como coinvestigador.',
      })
    }

    if (values.asesorIds.includes(values.investigadorPrincipalId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['asesorIds'],
        message: 'Ya es el investigador principal, no puede repetirse como asesor.',
      })
    }

    const overlap = values.coinvestigadorIds.filter((id) => values.asesorIds.includes(id))
    if (overlap.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['asesorIds'],
        message: 'Un coinvestigador no puede figurar simultáneamente como asesor.',
      })
    }

    if (values.esConvenio && !values.convenioId) {
      ctx.addIssue({ code: 'custom', path: ['convenioId'], message: 'Selecciona el convenio.' })
    }

    // Sin enmienda ni convenio hay pago de revisión: el monto lo fija la modalidad y el comprobante es obligatorio.
    if (!values.esEnmienda && !values.esConvenio) {
      if (values.pagoRevision === undefined || Number.isNaN(values.pagoRevision)) {
        ctx.addIssue({ code: 'custom', path: ['pagoRevision'], message: 'Selecciona la modalidad para establecer el pago.' })
      }
      if (!values.tipoComprobante) {
        ctx.addIssue({ code: 'custom', path: ['tipoComprobante'], message: 'Selecciona boleta o factura.' })
      }
      if (!values.comprobanteRevision.trim()) {
        ctx.addIssue({ code: 'custom', path: ['comprobanteRevision'], message: 'Ingresa el N° de comprobante.' })
      } else if (values.tipoComprobante) {
        const message = comprobanteError(values.tipoComprobante, values.comprobanteRevision)
        if (message) ctx.addIssue({ code: 'custom', path: ['comprobanteRevision'], message })
      }
    }

    if (values.tieneConstanciaEtica) {
      if (!values.idConstanciaEtica.trim()) {
        ctx.addIssue({ code: 'custom', path: ['idConstanciaEtica'], message: 'Ingresa el N° o código de la constancia.' })
      }
      if (!values.fechaConstancia) {
        ctx.addIssue({ code: 'custom', path: ['fechaConstancia'], message: 'Ingresa la fecha de la constancia.' })
      }
    }

    if (values.requiereRevisionHc) {
      if (values.montoHc === undefined || Number.isNaN(values.montoHc) || values.montoHc <= 0) {
        ctx.addIssue({ code: 'custom', path: ['montoHc'], message: 'Ingresa el monto de revisión de HC.' })
      }
      if (!values.tipoComprobanteHc || values.tipoComprobanteHc.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['tipoComprobanteHc'], message: 'Selecciona el tipo de comprobante.' })
      }
      if (!values.nroComprobanteHc || values.nroComprobanteHc.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['nroComprobanteHc'], message: 'Ingresa el N° de comprobante.' })
      } else if (values.tipoComprobanteHc) {
        const message = comprobanteError(values.tipoComprobanteHc, values.nroComprobanteHc)
        if (message) ctx.addIssue({ code: 'custom', path: ['nroComprobanteHc'], message })
      }
    }
  })

export type ProtocolFormValues = z.infer<typeof protocolFormSchema>

export const protocolStepFields: Record<string, (keyof ProtocolFormValues)[]> = {
  tipo: ['esEnmienda', 'protocoloOriginalId'],
  expediente: [
    'nroExpediente',
    'fechaRecepcion',
    'titulo',
    'lugarEjecucion',
    'esInstitucional',
    'destinoIds',
    'studyDesignIds',
  ],
  equipo: ['investigadorPrincipalId', 'coinvestigadorIds', 'asesorIds', 'lineaHrlId', 'lineaMeta2030Id'],
  institucionPago: [
    'institucionId',
    'facultadId',
    'modalidadId',
    'esConvenio',
    'convenioId',
    'pagoRevision',
    'tipoComprobante',
    'comprobanteRevision',
  ],
  historiaClinica: ['requiereRevisionHc', 'montoHc', 'tipoComprobanteHc', 'nroComprobanteHc'],
  documentacionEtica: [
    'tieneConstanciaEtica',
    'idConstanciaEtica',
    'fechaConstancia',
    'consentimientoInformado',
    'departamentoDirigidoPermiso',
    'certificadoBuenasPracticas',
  ],
  resumen: [],
}

export const protocolFormDefaultValues: ProtocolFormValues = {
  nroExpediente: '',
  fechaRecepcion: new Date().toISOString().slice(0, 10),
  titulo: '',
  lugarEjecucion: 'HOSPITAL REGIONAL DE LORETO',
  esInstitucional: true,

  investigadorPrincipalId: '',
  coinvestigadorIds: [],
  asesorIds: [],
  lineaHrlId: '',
  lineaMeta2030Id: '',

  institucionId: '',
  facultadId: '',
  destinoIds: [],
  studyDesignIds: [],
  modalidadId: '',

  esEnmienda: false,
  protocoloOriginalId: '',
  esConvenio: false,
  convenioId: '',
  pagoRevision: undefined,
  tipoComprobante: '',
  comprobanteRevision: '',

  requiereRevisionHc: false,
  montoHc: 50,
  tipoComprobanteHc: '',
  nroComprobanteHc: '',

  tieneConstanciaEtica: false,
  idConstanciaEtica: '',
  fechaConstancia: '',
  consentimientoInformado: false,
  departamentoDirigidoPermiso: '',
  certificadoBuenasPracticas: false,
}

/**
 * Precarga el formulario con los datos de un protocolo FINALIZED para registrar una enmienda.
 * El N° de expediente queda vacío (lo asigna la OADI al recibir la enmienda) y las fechas son de hoy.
 */
export function protocolToAmendmentFormValues(protocol: Protocol): ProtocolFormValues {
  const today = new Date().toISOString().slice(0, 10)
  return {
    nroExpediente: '',
    fechaRecepcion: today,
    titulo: protocol.titulo,
    lugarEjecucion: protocol.lugarEjecucion,
    esInstitucional: protocol.esInstitucional,

    investigadorPrincipalId: protocol.investigadorPrincipal.id,
    coinvestigadorIds: protocol.coinvestigadores.map((researcher) => researcher.id),
    asesorIds: protocol.asesores.map((researcher) => researcher.id),
    lineaHrlId: protocol.lineaHrl.id,
    lineaMeta2030Id: protocol.lineaMeta2030.id,

    institucionId: protocol.institucion?.id ?? '',
    facultadId: protocol.facultad?.id ?? '',
    destinoIds: protocol.destinos.map((destination) => destination.id),
    studyDesignIds: protocol.disenosEstudio.map((studyDesign) => studyDesign.id),
    modalidadId: protocol.modalidad.id,

    esEnmienda: true,
    protocoloOriginalId: protocol.id,
    esConvenio: Boolean(protocol.convenio),
    convenioId: protocol.convenio?.id ?? '',
    // La enmienda está exonerada del pago de revisión: no se arrastra el pago del original.
    pagoRevision: undefined,
    tipoComprobante: '',
    comprobanteRevision: '',

    requiereRevisionHc: protocol.requiereRevisionHc,
    montoHc: protocol.montoHc ?? 50,
    tipoComprobanteHc: protocol.tipoComprobanteHc ?? '',
    nroComprobanteHc: protocol.nroComprobanteHc ?? '',

    tieneConstanciaEtica: protocol.tieneConstanciaEtica,
    idConstanciaEtica: protocol.idConstanciaEtica ?? '',
    fechaConstancia: protocol.fechaConstancia?.slice(0, 10) ?? '',
    consentimientoInformado: protocol.consentimientoInformado,
    departamentoDirigidoPermiso: protocol.departamentoDirigidoPermiso ?? '',
    certificadoBuenasPracticas: protocol.certificadoBuenasPracticas,
  }
}
