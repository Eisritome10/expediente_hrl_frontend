import * as XLSX from 'xlsx'
import type { DashboardReport } from '@/api/protocols'
import type { ProtocolStatus } from '@/types/entities'

const statusLabels: Record<ProtocolStatus, string> = {
  CREATED: 'Creado',
  CIC_OBSERVED: 'Observado por comité CIC',
  CIC_CORRECTED: 'Corregido por comité CIC',
  CIEI_OBSERVED: 'Observado por comité CIEI',
  CIEI_CORRECTED: 'Corregido por comité CIEI',
  FINALIZED: 'Finalizado',
}

export function downloadDashboardReport(report: DashboardReport) {
  const summary = [
    { Indicador: 'Fecha inicial', Valor: report.from },
    { Indicador: 'Fecha final', Valor: report.to },
    { Indicador: 'Total de protocolos', Valor: report.total },
  ]

  const statuses = Object.entries(statusLabels).map(([status, label]) => ({
    Estado: label,
    Cantidad: report.byStatus[status as ProtocolStatus] ?? 0,
  }))

  const workbook = XLSX.utils.book_new()

  const summarySheet = XLSX.utils.json_to_sheet(summary)
  const statusSheet = XLSX.utils.json_to_sheet(statuses)

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')
  XLSX.utils.book_append_sheet(workbook, statusSheet, 'Estados')

  const filename = `reporte-dashboard-${report.from}-${report.to}.xlsx`

  XLSX.writeFile(workbook, filename)
}