import { useState } from 'react'
import {
  FlaskIcon,
  UsersIcon,
  BuildingsIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react'
import {
  useResearcherCount,
  useInstitutionCount,
  useDashboardReport,
} from '@/hooks/useDashboardStats'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card } from '@/components/ui/Card'
import { downloadDashboardReport } from '@/utils/dashboardReport'
import type { ProtocolStatus } from '@/types/entities'

const statusLabels: Record<ProtocolStatus, string> = {
  CREATED: 'Creado',
  CIC_OBSERVED: 'Observado por comité CIC',
  CIC_CORRECTED: 'Corregido por comité CIC',
  CIEI_OBSERVED: 'Observado por comité CIEI',
  CIEI_CORRECTED: 'Corregido por comité CIEI',
  FINALIZED: 'Finalizado',
}

const statusOrder: ProtocolStatus[] = [
  'CREATED',
  'CIC_OBSERVED',
  'CIC_CORRECTED',
  'CIEI_OBSERVED',
  'CIEI_CORRECTED',
  'FINALIZED',
]

export function DashboardPage() {
  const researcherCount = useResearcherCount()
  const institutionCount = useInstitutionCount()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [customRange, setCustomRange] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  // Reporte del trimestre actual.
  const quarterlyReport = useDashboardReport()

  // Reporte personalizado. Solo consultara la API si se ha activado la opcion y seleccionado ambas fechas.
  const customReport = useDashboardReport(
    from || undefined,
    to || undefined,
    customRange && Boolean(from) && Boolean(to),
)

  function handleQuarterlyDownload() {
    setDownloadError('')

    if (quarterlyReport.isPending) {
      setDownloadError('Espera a que se carguen los datos del reporte.')
      return
    }

    if (quarterlyReport.isError || !quarterlyReport.data) {
      setDownloadError('No se pudo obtener el reporte trimestral.')
      return
    }

    downloadDashboardReport(quarterlyReport.data)
  }

  function handleCustomDownload() {
    setDownloadError('')

    if (!from || !to) {
      setDownloadError('Selecciona la fecha inicial y la fecha final.')
      return
    }

    if (from > to) {
      setDownloadError(
        'La fecha inicial no puede ser posterior a la fecha final.',
      )
      return
    }

    if (customReport.isFetching) {
      setDownloadError(
        'Espera a que se carguen los datos del rango seleccionado.',
      )
      return
    }

    if (customReport.isError || !customReport.data) {
      setDownloadError(
        'No se pudo obtener el reporte. Inténtalo nuevamente.',
      )
      return
    }

    if (
      customReport.data.from !== from ||
      customReport.data.to !== to
    ) {
      setDownloadError(
        'El reporte recibido no corresponde al rango seleccionado.',
      )
      return
    }

    downloadDashboardReport(customReport.data)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">
          Resumen general de la actividad del sistema.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Protocolos de investigación"
          value={quarterlyReport.data?.total}
          loading={quarterlyReport.isPending}
          error={quarterlyReport.isError}
          icon={FlaskIcon}
        />

        <StatCard
          label="Comunidad Científica"
          value={researcherCount.data}
          loading={researcherCount.isPending}
          error={researcherCount.isError}
          icon={UsersIcon}
        />

        <StatCard
          label="Instituciones Aliadas"
          value={institutionCount.data}
          loading={institutionCount.isPending}
          error={institutionCount.isError}
          icon={BuildingsIcon}
        />
      </section>

      <section>
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text">
              Estado Situacional
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Protocolos recibidos entre{' '}
              {quarterlyReport.data?.from ?? '...'} y{' '}
              {quarterlyReport.data?.to ?? '...'}
            </p>
          </div>

          {quarterlyReport.isError && (
            <p className="mb-4 text-sm text-red-600">
              No se pudieron cargar las estadísticas de protocolos.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statusOrder.map((status) => (
              <div
                key={status}
                className="rounded-lg border border-border p-3.5"
              >
                <p className="text-2xl font-semibold text-text">
                  {quarterlyReport.data?.byStatus[status] ?? '—'}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {statusLabels[status]}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-text">
              Descargar reporte Excel
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Descarga las estadísticas del trimestre actual o selecciona un
              rango personalizado.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleQuarterlyDownload}
              disabled={
                quarterlyReport.isPending ||
                quarterlyReport.isError ||
                !quarterlyReport.data
              }
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadSimpleIcon size={18} />
              Descargar reporte trimestral
            </button>

            <button
              type="button"
              onClick={() => {
                setCustomRange(true)
                setDownloadError('')
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text"
            >
              Personalizar fechas
            </button>
          </div>

          {customRange && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-1 text-sm text-text">
                Fecha inicial
                <input
                  type="date"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value)
                    setDownloadError('')
                  }}
                  className="rounded-lg border border-border bg-transparent px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-text">
                Fecha final
                <input
                  type="date"
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value)
                    setDownloadError('')
                  }}
                  className="rounded-lg border border-border bg-transparent px-3 py-2"
                />
              </label>

              <button
                type="button"
                onClick={handleCustomDownload}
                disabled={customReport.isFetching}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Descargar Excel personalizado
              </button>
            </div>
          )}

          {downloadError && (
            <p role="alert" className="text-sm text-red-600">
              {downloadError}
            </p>
          )}
        </Card>
      </section>
    </div>
  )
}
