import type { ProtocolStatus, ResearcherProtocolDetail } from '@/types/entities'

export type JourneyStageId = 'registered' | 'clinical' | 'ethics' | 'concluded'
export type JourneyStageState = 'done' | 'current' | 'upcoming'

export interface JourneyStage {
  id: JourneyStageId
  title: string
  description: string
  state: JourneyStageState
  /** Fecha en que se completó la etapa (ISO), si ya ocurrió. */
  completedAt: string | null
}

export interface Journey {
  stages: JourneyStage[]
  /** Posición de la etapa en curso; en un proceso concluido es la última. */
  currentIndex: number
  /** El protocolo espera una corrección del investigador. */
  needsAction: boolean
  concluded: boolean
  headline: string
  detail: string
  /** Qué sigue después de la etapa actual; nulo al concluir. */
  nextStep: string | null
  goal: string
}

const GOAL = 'Aprobación ética del protocolo'

const STAGE_TEXT: Record<JourneyStageId, { title: string; description: string }> = {
  registered: { title: 'Protocolo registrado', description: 'Tu expediente fue recibido.' },
  clinical: { title: 'Comité de Investigación Clínica', description: 'Evalúa tu protocolo.' },
  ethics: { title: 'Comité de Ética en Investigación', description: 'Evalúa los aspectos éticos y define el nivel de riesgo.' },
  concluded: { title: 'Proceso concluido', description: 'Tu protocolo cuenta con aprobación ética.' },
}

const CLINICAL = STAGE_TEXT.clinical.title
const ETHICS = STAGE_TEXT.ethics.title

const OBSERVED: ProtocolStatus[] = ['CIC_OBSERVED', 'CIEI_OBSERVED']
const CORRECTED: ProtocolStatus[] = ['CIC_CORRECTED', 'CIEI_CORRECTED']

function latestDate(reviews: ResearcherProtocolDetail['reviews'], outcome: 'APPROVED' | 'FINALIZED') {
  const dates = reviews.filter((review) => review.outcome === outcome).map((review) => review.createdAt)
  return dates.length > 0 ? dates.sort().at(-1)! : null
}

/** Traduce el estado y los dictámenes del protocolo a un recorrido en cuatro etapas: dónde está y dónde termina. */
export function buildJourney(protocol: ResearcherProtocolDetail): Journey {
  const { status, reviews } = protocol
  const clinicalApprovedAt = latestDate(reviews, 'APPROVED')
  const finalizedAt = latestDate(reviews, 'FINALIZED')

  const concluded = status === 'FINALIZED'
  const inEthics = concluded || status === 'CIEI_OBSERVED' || status === 'CIEI_CORRECTED' || clinicalApprovedAt !== null
  const currentIndex = concluded ? 3 : inEthics ? 2 : 1
  const needsAction = OBSERVED.includes(status)
  const corrected = CORRECTED.includes(status)

  const completedAt: Record<JourneyStageId, string | null> = {
    registered: protocol.fechaRecepcion,
    clinical: inEthics ? clinicalApprovedAt : null,
    ethics: concluded ? finalizedAt : null,
    concluded: concluded ? finalizedAt : null,
  }

  const order: JourneyStageId[] = ['registered', 'clinical', 'ethics', 'concluded']
  const stages = order.map((id, index): JourneyStage => ({
    id,
    ...STAGE_TEXT[id],
    state: concluded || index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
    completedAt: completedAt[id],
  }))

  const committee = inEthics ? ETHICS : CLINICAL
  let headline: string
  let detail: string

  if (concluded) {
    headline = 'Proceso concluido'
    detail = 'Tu protocolo completó todas las etapas y cuenta con aprobación ética.'
  } else if (needsAction) {
    headline = 'Hay observaciones por corregir'
    detail = `El ${committee} revisó tu protocolo y pidió cambios. Acércate a la oficina de investigación para corregirlos y que el protocolo continúe.`
  } else if (corrected) {
    headline = 'Corrección enviada'
    detail = `Las observaciones ya fueron corregidas. El ${committee} volverá a evaluar tu protocolo.`
  } else {
    headline = `En evaluación del ${committee}`
    detail = `El ${committee} está evaluando tu protocolo. No necesitas hacer nada por ahora.`
  }

  const nextStep = concluded
    ? null
    : needsAction
      ? `Corregir las observaciones y volver a la evaluación del ${committee}`
      : inEthics
        ? 'Conclusión del proceso con la aprobación ética'
        : `Evaluación del ${ETHICS}`

  return { stages, currentIndex, needsAction, concluded, headline, detail, nextStep, goal: GOAL }
}
