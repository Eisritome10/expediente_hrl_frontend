import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { PencilSimpleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { useDestinationsList } from '@/hooks/useDestinations'
import { useFacultiesList } from '@/hooks/useFaculties'
import { useInstitutionsList } from '@/hooks/useInstitutions'
import { useModalitiesList } from '@/hooks/useModalities'
import { useResearchersList } from '@/hooks/useResearchers'
import { useResearchLinesByType } from '@/hooks/useResearchLines'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

const CATALOG_LIMIT = 100

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <dt className="text-xs font-medium text-text-muted uppercase">{label}</dt>
      <dd className="text-sm text-text">{value || '—'}</dd>
    </div>
  )
}

function SummarySection({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <Button type="button" variant="secondary" onClick={onEdit} className="px-3 py-1.5 text-xs">
          <PencilSimpleIcon size={15} />
          Editar
        </Button>
      </div>
      <dl className="divide-y divide-border">{children}</dl>
    </div>
  )
}

export function ResumenStep({ onEditStep }: { onEditStep: (index: number) => void }) {
  const { watch } = useFormContext<ProtocolFormValues>()
  const values = watch()

  const researchers = useResearchersList({ page: 1, limit: CATALOG_LIMIT })
  const institutions = useInstitutionsList({ page: 1, limit: CATALOG_LIMIT })
  const faculties = useFacultiesList({ page: 1, limit: CATALOG_LIMIT })
  const destinations = useDestinationsList({ page: 1, limit: CATALOG_LIMIT })
  const modalities = useModalitiesList({ page: 1, limit: CATALOG_LIMIT })
  const lineasHrl = useResearchLinesByType('HRL')
  const lineasMeta2030 = useResearchLinesByType('META_2030')

  const researcherLabel = (id: string) => {
    const researcher = researchers.data?.data.find((item) => item.id === id)
    return researcher ? `${researcher.firstName} ${researcher.lastName}` : ''
  }
  const researcherList = (ids: string[]) => ids.map(researcherLabel).filter(Boolean).join(', ')

  const institutionLabel = institutions.data?.data.find((item) => item.id === values.institucionId)?.name ?? ''
  const facultyLabel = faculties.data?.data.find((item) => item.id === values.facultadId)?.name ?? ''
  const destinationLabels = values.destinoIds
    .map((id) => destinations.data?.data.find((item) => item.id === id)?.description)
    .filter(Boolean)
    .join(', ')
  const modalityLabel = modalities.data?.data.find((item) => item.id === values.modalidadId)?.name ?? ''
  const lineaHrlLabel = lineasHrl.data?.data.find((item) => item.id === values.lineaHrlId)?.name ?? ''
  const lineaMeta2030Label = lineasMeta2030.data?.data.find((item) => item.id === values.lineaMeta2030Id)?.name ?? ''

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">
        Revisa los datos antes de registrar el protocolo. Podés usar "Editar" o la línea de pasos de arriba para volver
        a cualquier sección y corregir algo.
      </p>

      <SummarySection title="Expediente" onEdit={() => onEditStep(0)}>
        <SummaryRow label="N° de expediente" value={values.nroExpediente} />
        <SummaryRow label="Fecha de recepción" value={values.fechaRecepcion} />
        <SummaryRow label="Título" value={values.titulo} />
        <SummaryRow label="Diseño del estudio" value={values.disenoEstudio} />
        <SummaryRow label="Lugar de ejecución" value={values.lugarEjecucion} />
        <SummaryRow label="Institucional" value={values.esInstitucional ? 'Sí' : 'No'} />
        <SummaryRow label="Destinos (memos)" value={destinationLabels} />
      </SummarySection>

      <SummarySection title="Equipo y líneas" onEdit={() => onEditStep(1)}>
        <SummaryRow label="Investigador principal" value={researcherLabel(values.investigadorPrincipalId)} />
        <SummaryRow label="Coinvestigadores" value={researcherList(values.coinvestigadorIds)} />
        <SummaryRow label="Asesores" value={researcherList(values.asesorIds)} />
        <SummaryRow label="Línea HRL" value={lineaHrlLabel} />
        <SummaryRow label="Línea Meta 2030" value={lineaMeta2030Label} />
      </SummarySection>

      <SummarySection title="Institución y modalidad" onEdit={() => onEditStep(2)}>
        <SummaryRow label="Institución" value={institutionLabel} />
        <SummaryRow label="Facultad" value={facultyLabel} />
        <SummaryRow label="Modalidad" value={modalityLabel} />
      </SummarySection>

      <SummarySection title="Revisión y pago" onEdit={() => onEditStep(3)}>
        <SummaryRow label="Propósito de la revisión" value={values.propositoRevision} />
        <SummaryRow label="Fecha de revisión" value={values.fechaRevision ?? ''} />
        <SummaryRow label="Enmienda" value={values.esEnmienda ? 'Sí' : 'No'} />
        <SummaryRow label="Convenio" value={values.esConvenio ? `Sí — ${values.nombreConvenio}` : 'No'} />
        {!values.esEnmienda && !values.esConvenio && (
          <SummaryRow
            label="Pago de revisión"
            value={values.pagoRevision ? `S/ ${Number(values.pagoRevision).toFixed(2)} (${values.tipoComprobante} ${values.comprobanteRevision ?? ''})` : ''}
          />
        )}
      </SummarySection>

      <SummarySection title="Historia clínica" onEdit={() => onEditStep(4)}>
        <SummaryRow label="Requiere revisión de HC" value={values.requiereRevisionHc ? 'Sí' : 'No'} />
        {values.requiereRevisionHc && (
          <SummaryRow
            label="Detalle"
            value={`S/ ${Number(values.montoHc ?? 0).toFixed(2)} — ${values.tipoComprobanteHc} ${values.nroComprobanteHc ?? ''}`}
          />
        )}
        <SummaryRow label="Certificado de buenas prácticas" value={values.certificadoBuenasPracticas ? 'Sí' : 'No'} />
      </SummarySection>
    </div>
  )
}
