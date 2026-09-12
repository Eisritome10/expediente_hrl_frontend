export const mockProjectCount = 214

export interface PipelineStage {
  label: string
  count: number
  tone: 'warning' | 'brand' | 'neutral'
}

export const mockPipelineStages: PipelineStage[] = [
  { label: 'Observados HC', count: 12, tone: 'warning' },
  { label: 'Obs. Comité CIC', count: 7, tone: 'warning' },
  { label: 'Obs. Comité Ética', count: 5, tone: 'warning' },
  { label: 'En Ejecución', count: 34, tone: 'brand' },
  { label: 'Fase de Cierre', count: 18, tone: 'neutral' },
]
