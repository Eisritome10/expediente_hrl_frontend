import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlusIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useProtocolsList } from '@/hooks/useProtocols'

const PAGE_SIZE = 10

export function ProtocolsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const searchTerm = useDebouncedValue(searchInput, 300)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }

  const { data, isPending, isError } = useProtocolsList({
    page,
    limit: PAGE_SIZE,
    nroExpediente: searchTerm.trim() || undefined,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Protocolos</h1>
          <p className="text-sm text-text-muted">Protocolos de investigación registrados en el sistema.</p>
        </div>
        <Button onClick={() => navigate('/protocolos/nuevo')}>
          <FilePlusIcon size={16} />
          Nuevo protocolo
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por N° de expediente..."
        aria-label="Buscar protocolo"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de protocolos. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>N° Expediente</TableTh>
              <TableTh>Título</TableTh>
              <TableTh>Investigador principal</TableTh>
              <TableTh>Fecha de recepción</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={4} />
              ) : (data?.data.length ?? 0) > 0 ? (
                data!.data.map((protocol) => (
                  <TableRow
                    key={protocol.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/protocolos/${protocol.id}`)}
                  >
                    <TableTd className="font-medium text-text">{protocol.nroExpediente}</TableTd>
                    <TableTd className="max-w-xs truncate">{protocol.titulo}</TableTd>
                    <TableTd className="text-text-muted">
                      {protocol.investigadorPrincipal.firstName} {protocol.investigadorPrincipal.lastName}
                    </TableTd>
                    <TableTd className="text-text-muted">{protocol.fechaRecepcion.slice(0, 10)}</TableTd>
                  </TableRow>
                ))
              ) : searchTerm ? (
                <TableEmptyState colSpan={4} message="No se encontraron protocolos para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={4}
                  message="Aún no hay protocolos registrados."
                  action={
                    <Button variant="secondary" onClick={() => navigate('/protocolos/nuevo')}>
                      <FilePlusIcon size={16} />
                      Registrar el primero
                    </Button>
                  }
                />
              )}
            </TableBody>
          </Table>

          {data?.meta && data.meta.total > 0 && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}
