import { z } from 'zod'

const uuidField = z.string().min(1, 'Selecciona una opción.')

function trimmedText(min: number, max: number, message: string) {
  return z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(min, message).max(max, `Máximo ${max} caracteres.`))
}

function trimmedOptionalText() {
  return z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? '')
}

export function normalizeAlnum(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const optionalNumber = z.union([z.number(), z.nan()]).optional()

export const protocolFormSchema = z
  .object({
    nroExpediente: trimmedText(1, 255, 'Ingresa el número de expediente.'),
    fechaRecepcion: z.string().min(1, 'Selecciona la fecha de recepción.'),
    titulo: trimmedText(1, 500, 'Ingresa el título del proyecto.'),
    disenoEstudio: trimmedText(1, 255, 'Ingresa el diseño del estudio.'),
    lugarEjecucion: trimmedText(1, 255, 'Ingresa el lugar de ejecución.'),
    esInstitucional: z.boolean(),

    investigadorPrincipalId: uuidField,
    coinvestigadorIds: z.array(z.string()),
    asesorIds: z.array(z.string()),
    lineaHrlId: uuidField,
    lineaMeta2030Id: uuidField,

    institucionId: trimmedOptionalText(),
    facultadId: trimmedOptionalText(),
    destinoIds: z.array(z.string()),
    modalidadId: uuidField,

    propositoRevision: trimmedText(1, 255, 'Ingresa el propósito de la revisión.'),
    fechaRevision: trimmedOptionalText(),
    esEnmienda: z.boolean(),
    esConvenio: z.boolean(),
    nombreConvenio: trimmedOptionalText(),
    pagoRevision: optionalNumber,
    tipoComprobante: trimmedOptionalText(),
    comprobanteRevision: trimmedOptionalText(),

    requiereRevisionHc: z.boolean(),
    montoHc: optionalNumber,
    tipoComprobanteHc: trimmedOptionalText(),
    nroComprobanteHc: trimmedOptionalText(),
    certificadoBuenasPracticas: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.esConvenio && !values.nombreConvenio) {
      ctx.addIssue({
        code: 'custom',
        path: ['nombreConvenio'],
        message: 'Ingresa el nombre de la institución del convenio.',
      })
    }

    if (!values.esInstitucional && normalizeAlnum(values.lugarEjecucion).includes('hospitalregional')) {
      ctx.addIssue({
        code: 'custom',
        path: ['lugarEjecucion'],
        message: 'No puede ser el Hospital Regional (ni variantes) si el protocolo no es institucional.',
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

    if (values.requiereRevisionHc) {
      if (values.montoHc === undefined || Number.isNaN(values.montoHc)) {
        ctx.addIssue({ code: 'custom', path: ['montoHc'], message: 'Ingresa el monto de revisión de HC.' })
      }
      if (!values.tipoComprobanteHc) {
        ctx.addIssue({ code: 'custom', path: ['tipoComprobanteHc'], message: 'Selecciona el tipo de comprobante.' })
      }
      if (!values.nroComprobanteHc) {
        ctx.addIssue({ code: 'custom', path: ['nroComprobanteHc'], message: 'Ingresa el N° de comprobante.' })
      }
    }
  })

export type ProtocolFormValues = z.infer<typeof protocolFormSchema>

export const protocolStepFields = {
  expediente: [
    'nroExpediente',
    'fechaRecepcion',
    'titulo',
    'disenoEstudio',
    'lugarEjecucion',
    'esInstitucional',
    'destinoIds',
  ],
  equipo: ['investigadorPrincipalId', 'coinvestigadorIds', 'asesorIds', 'lineaHrlId', 'lineaMeta2030Id'],
  institucion: ['institucionId', 'facultadId', 'modalidadId'],
  revision: [
    'propositoRevision',
    'fechaRevision',
    'esEnmienda',
    'esConvenio',
    'nombreConvenio',
    'pagoRevision',
    'tipoComprobante',
    'comprobanteRevision',
  ],
  historiaClinica: ['requiereRevisionHc', 'montoHc', 'tipoComprobanteHc', 'nroComprobanteHc', 'certificadoBuenasPracticas'],
  resumen: [],
} as const satisfies Record<string, ReadonlyArray<keyof ProtocolFormValues>>

export const protocolFormDefaultValues: ProtocolFormValues = {
  nroExpediente: '',
  fechaRecepcion: new Date().toISOString().slice(0, 10),
  titulo: '',
  disenoEstudio: '',
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
  modalidadId: '',

  propositoRevision: '',
  fechaRevision: '',
  esEnmienda: false,
  esConvenio: false,
  nombreConvenio: '',
  pagoRevision: undefined,
  tipoComprobante: '',
  comprobanteRevision: '',

  requiereRevisionHc: false,
  montoHc: undefined,
  tipoComprobanteHc: '',
  nroComprobanteHc: '',
  certificadoBuenasPracticas: false,
}
