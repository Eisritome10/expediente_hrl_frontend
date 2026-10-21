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

const statusOrder: ProtocolStatus[] = [
  'CREATED',
  'CIC_OBSERVED',
  'CIC_CORRECTED',
  'CIEI_OBSERVED',
  'CIEI_CORRECTED',
  'FINALIZED',
]

// Agrupación por etapa del proceso, para leer el reporte de un vistazo.
const stages: { label: string; statuses: ProtocolStatus[] }[] = [
  { label: 'Recibidos (sin revisión)', statuses: ['CREATED'] },
  { label: 'En revisión CIC', statuses: ['CIC_OBSERVED', 'CIC_CORRECTED'] },
  { label: 'En revisión CIEI', statuses: ['CIEI_OBSERVED', 'CIEI_CORRECTED'] },
  { label: 'Finalizados', statuses: ['FINALIZED'] },
]

const BRAND = 'FF146C43'
const BRAND_DARK = 'FF0F4C29'
const BRAND_LIGHT = 'FFEAF5EE'
const BORDER = 'FFD5DBD7'
const MUTED = 'FF5C655F'

function formatDate(value: string): string {
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

export async function downloadDashboardReport(report: DashboardReport) {
  // exceljs es pesado: se carga solo al descargar, no con el resto de la app.
  const { default: ExcelJS } = await import('exceljs')

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Hospital Regional de Loreto'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Reporte de protocolos', {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
  })

  sheet.columns = [{ width: 38 }, { width: 14 }, { width: 18 }]

  const thinBorder = {
    top: { style: 'thin' as const, color: { argb: BORDER } },
    left: { style: 'thin' as const, color: { argb: BORDER } },
    bottom: { style: 'thin' as const, color: { argb: BORDER } },
    right: { style: 'thin' as const, color: { argb: BORDER } },
  }

  // Encabezado institucional
  sheet.mergeCells('A1:C1')
  const title = sheet.getCell('A1')
  title.value = 'HOSPITAL REGIONAL DE LORETO'
  title.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } }
  title.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 30

  sheet.mergeCells('A2:C2')
  const subtitle = sheet.getCell('A2')
  subtitle.value = 'Reporte de seguimiento de protocolos de investigación'
  subtitle.font = { name: 'Calibri', size: 11, color: { argb: 'FFFFFFFF' } }
  subtitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_DARK } }
  subtitle.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(2).height = 22

  // Datos generales
  const meta: [string, string | number][] = [
    ['Periodo del reporte', `${formatDate(report.from)} al ${formatDate(report.to)}`],
    ['Fecha de generación', new Date().toLocaleDateString('es-PE')],
    ['Total de protocolos', report.total],
  ]

  meta.forEach(([label, value], index) => {
    const row = sheet.getRow(4 + index)
    row.getCell(1).value = label
    row.getCell(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: BRAND_DARK } }
    sheet.mergeCells(4 + index, 2, 4 + index, 3)
    row.getCell(2).value = value
    row.getCell(2).font = { name: 'Calibri', size: 11, bold: label === 'Total de protocolos' }
    row.getCell(2).alignment = { horizontal: 'left' }
  })

  // Tabla genérica con encabezado verde, filas alternadas, % del total y fila de total
  const percentOf = (count: number) => (report.total > 0 ? count / report.total : 0)

  function writeTable(startRow: number, heading: string, rows: { label: string; count: number }[]): number {
    const header = sheet.getRow(startRow)
    ;[heading, 'Cantidad', '% del total'].forEach((text, i) => {
      const cell = header.getCell(i + 1)
      cell.value = text
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } }
      cell.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle' }
      cell.border = thinBorder
    })
    header.height = 22

    rows.forEach((item, index) => {
      const row = sheet.getRow(startRow + 1 + index)
      row.getCell(1).value = item.label
      row.getCell(2).value = item.count
      row.getCell(3).value = percentOf(item.count)
      row.getCell(3).numFmt = '0.0%'
      for (let col = 1; col <= 3; col++) {
        const cell = row.getCell(col)
        cell.font = { name: 'Calibri', size: 11 }
        cell.border = thinBorder
        cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' }
        if (index % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } }
      }
      row.height = 20
    })

    const totalRowIndex = startRow + 1 + rows.length
    const totalRow = sheet.getRow(totalRowIndex)
    totalRow.getCell(1).value = 'Total'
    const sumCount = rows.reduce((sum, item) => sum + item.count, 0)
    totalRow.getCell(2).value = { formula: `SUM(B${startRow + 1}:B${totalRowIndex - 1})`, result: sumCount }
    totalRow.getCell(3).value = { formula: `SUM(C${startRow + 1}:C${totalRowIndex - 1})`, result: percentOf(sumCount) }
    totalRow.getCell(3).numFmt = '0.0%'
    for (let col = 1; col <= 3; col++) {
      const cell = totalRow.getCell(col)
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BRAND_DARK } }
      cell.border = { ...thinBorder, top: { style: 'medium', color: { argb: BRAND } } }
      cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' }
    }
    totalRow.height = 22

    return totalRowIndex
  }

  const statusRows = statusOrder.map((status) => ({
    label: statusLabels[status],
    count: report.byStatus[status] ?? 0,
  }))
  const stageRows = stages.map((stage) => ({
    label: stage.label,
    count: stage.statuses.reduce((sum, status) => sum + (report.byStatus[status] ?? 0), 0),
  }))

  sheet.getCell('A8').value = 'Resumen por etapa del proceso'
  sheet.getCell('A8').font = { name: 'Calibri', size: 12, bold: true, color: { argb: BRAND_DARK } }
  const stageEnd = writeTable(9, 'Etapa', stageRows)

  const detailTitleRow = stageEnd + 2
  sheet.getCell(`A${detailTitleRow}`).value = 'Detalle por estado'
  sheet.getCell(`A${detailTitleRow}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: BRAND_DARK } }
  const detailEnd = writeTable(detailTitleRow + 1, 'Estado', statusRows)

  sheet.mergeCells(`A${detailEnd + 2}:C${detailEnd + 2}`)
  const note = sheet.getCell(`A${detailEnd + 2}`)
  note.value = 'Los protocolos se cuentan según su fecha de recepción dentro del periodo indicado.'
  note.font = { name: 'Calibri', size: 9, italic: true, color: { argb: MUTED } }
  note.alignment = { wrapText: true, vertical: 'top' }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-dashboard-${report.from}-${report.to}.xlsx`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
