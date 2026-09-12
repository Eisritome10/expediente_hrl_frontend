import { FlaskIcon, UsersIcon, BuildingsIcon } from '@phosphor-icons/react'
import { useResearcherCount, useInstitutionCount } from '@/hooks/useDashboardStats'
import { mockProjectCount, mockPipelineStages } from '@/mocks/dashboard.mock'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card } from '@/components/ui/Card'
import { MockDataNote } from '@/components/ui/Badge'

export function DashboardPage() {
  const researcherCount = useResearcherCount()
  const institutionCount = useInstitutionCount()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">Resumen general de la actividad del sistema.</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Proyectos de Investigación" value={mockProjectCount} icon={FlaskIcon} isMock />
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text">Estado Situacional</h2>
            <MockDataNote>Pipeline de revisión — módulo de Protocolos pendiente</MockDataNote>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {mockPipelineStages.map((stage) => (
              <div key={stage.label} className="rounded-lg border border-border p-3.5">
                <p className="text-2xl font-semibold text-text">{stage.count}</p>
                <p className="mt-1 text-xs text-text-muted">{stage.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
