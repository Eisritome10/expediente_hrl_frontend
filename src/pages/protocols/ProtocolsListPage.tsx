import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlusIcon, FunnelIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Input'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useProtocolsList } from '@/hooks/useProtocols'
import { matchesProtocolSearch } from '@/pages/protocols/protocol-search'
import { ProtocolStatusBadge } from '@/pages/protocols/ProtocolStatusBadge'
import type { ProtocolStatus } from '@/types/entities'

const PAGE_SIZE = 6
const SEARCH_FETCH_LIMIT = 100

export function ProtocolsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ProtocolStatus | ''>('')

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const handleStatusChange = (status: ProtocolStatus | '') => {
    setSelectedStatus(status)
    setPage(1)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useProtocolsList({
    page: isSearching ? 1 : page,
    limit: isSearching ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
    status: selectedStatus || undefined,
  })

  const filteredProtocols = useMemo(
    () => (isSearching && data ? data.data.filter((protocol) => matchesProtocolSearch(protocol, searchTerm)) : null),
    [isSearching, data, searchTerm],
  )

  const visibleProtocols = isSearching
    ? (filteredProtocols ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredProtocols?.length ?? 0 }
    : data?.meta

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={searchInput}
          onChange={(event) => handleSearchChange(event.target.value)}
          onClear={() => handleSearchChange('')}
          placeholder="Buscar por N° de expediente, título o investigador principal..."
          aria-label="Buscar protocolo"
          className="flex-1"
        />

        <div className="flex items-center gap-2">
          <FunnelIcon size={16} className="text-text-muted" />
          <Select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value as ProtocolStatus | '')}
            aria-label="Filtrar por estado"
            className="w-48 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="CREATED">Creado</option>
            <option value="CIC_OBSERVED">Observado CIC</option>
            <option value="CIC_CORRECTED">Corregido CIC</option>
            <option value="CIEI_OBSERVED">Observado CIEI</option>
            <option value="CIEI_CORRECTED">Corregido CIEI</option>
            <option value="FINALIZED">Finalizado</option>
          </Select>
        </div>
      </div>

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
              <TableTh>Estado</TableTh>
              <TableTh>Investigador principal</TableTh>
              <TableTh>Fecha de recepción</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={5} />
              ) : visibleProtocols.length > 0 ? (
                visibleProtocols.map((protocol) => (
                  <TableRow
                    key={protocol.id}
                    className="cursor-pointer hover:bg-surface-muted/50"
                    onClick={() => navigate(`/protocolos/${protocol.id}`)}
                  >
                    <TableTd className="font-medium text-text">{protocol.nroExpediente}</TableTd>
                    <TableTd className="max-w-xs truncate">{protocol.titulo}</TableTd>
                    <TableTd>
                      <ProtocolStatusBadge status={protocol.status} />
                    </TableTd>
                    <TableTd className="text-text-muted">
                      {protocol.investigadorPrincipal.firstName} {protocol.investigadorPrincipal.lastName}
                    </TableTd>
                    <TableTd className="text-text-muted">{protocol.fechaRecepcion.slice(0, 10)}</TableTd>
                  </TableRow>
                ))
              ) : isSearching || selectedStatus ? (
                <TableEmptyState colSpan={5} message="No se encontraron protocolos con los filtros aplicados." />
              ) : (
                <TableEmptyState
                  colSpan={5}
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

          {paginationMeta && paginationMeta.total > 0 && (
            <Pagination meta={paginationMeta} onPageChange={isSearching ? setSearchPage : setPage} />
          )}
        </>
      )}
    </div>
  )
}
