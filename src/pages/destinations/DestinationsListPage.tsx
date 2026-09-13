import { useMemo, useState } from 'react'
import { PencilSimpleIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteDestination, useDestinationsList } from '@/hooks/useDestinations'
import { DestinationFormDialog } from '@/pages/destinations/DestinationFormDialog'
import { matchesDestinationSearch } from '@/pages/destinations/destination-search'
import type { Destination } from '@/types/entities'

const PAGE_SIZE = 10
const SEARCH_FETCH_LIMIT = 100

export function DestinationsListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)
  const [deletingDestination, setDeletingDestination] = useState<Destination | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useDestinationsList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteDestination = useDeleteDestination()

  const filteredDestinations = useMemo(
    () =>
      isSearching && data ? data.data.filter((destination) => matchesDestinationSearch(destination, searchTerm)) : null,
    [isSearching, data, searchTerm],
  )

  const visibleDestinations = isSearching
    ? (filteredDestinations ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredDestinations?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingDestination(null)
    setFormOpen(true)
  }

  const openEditDialog = (destination: Destination) => {
    setEditingDestination(destination)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingDestination) return
    await deleteDestination.mutateAsync(deletingDestination.id)
    setDeletingDestination(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Destinos</h1>
          <p className="text-sm text-text-muted">Catálogo de destinos registrados en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nuevo destino
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por descripción..."
        aria-label="Buscar destino"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de destinos. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>Descripción</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={2} />
              ) : visibleDestinations.length > 0 ? (
                visibleDestinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableTd>{destination.description}</TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton onClick={() => openEditDialog(destination)} aria-label={`Editar ${destination.description}`}>
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        <IconButton
                          tone="danger"
                          onClick={() => setDeletingDestination(destination)}
                          aria-label={`Eliminar ${destination.description}`}
                        >
                          <TrashIcon size={16} />
                        </IconButton>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={2} message="No se encontraron destinos para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={2}
                  message="Aún no hay destinos registrados."
                  action={
                    <Button variant="secondary" onClick={openCreateDialog}>
                      <PlusIcon size={16} />
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

      <DestinationFormDialog open={formOpen} onClose={() => setFormOpen(false)} destination={editingDestination} />

      <ConfirmDialog
        open={Boolean(deletingDestination)}
        onClose={() => setDeletingDestination(null)}
        onConfirm={confirmDelete}
        loading={deleteDestination.isPending}
        title="Eliminar destino"
        description={
          deletingDestination && (
            <>
              ¿Seguro que deseas eliminar <strong>{deletingDestination.description}</strong>? Esta acción no se puede
              deshacer.
            </>
          )
        }
      />
    </div>
  )
}
