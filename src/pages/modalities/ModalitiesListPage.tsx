import { useMemo, useState } from 'react'
import { PencilSimpleIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteModality, useModalitiesList } from '@/hooks/useModalities'
import { ModalityFormDialog } from '@/pages/modalities/ModalityFormDialog'
import { matchesModalitySearch } from '@/pages/modalities/modality-search'
import type { Modality } from '@/types/entities'

const PAGE_SIZE = 10
const SEARCH_FETCH_LIMIT = 100

export function ModalitiesListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingModality, setEditingModality] = useState<Modality | null>(null)
  const [deletingModality, setDeletingModality] = useState<Modality | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useModalitiesList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteModality = useDeleteModality()

  const filteredModalities = useMemo(
    () => (isSearching && data ? data.data.filter((modality) => matchesModalitySearch(modality, searchTerm)) : null),
    [isSearching, data, searchTerm],
  )

  const visibleModalities = isSearching
    ? (filteredModalities ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredModalities?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingModality(null)
    setFormOpen(true)
  }

  const openEditDialog = (modality: Modality) => {
    setEditingModality(modality)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingModality) return
    await deleteModality.mutateAsync(deletingModality.id)
    setDeletingModality(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Modalidades</h1>
          <p className="text-sm text-text-muted">Catálogo de modalidades registradas en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nueva modalidad
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por nombre..."
        aria-label="Buscar modalidad"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de modalidades. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>Nombre</TableTh>
              <TableTh>Costo</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={3} />
              ) : visibleModalities.length > 0 ? (
                visibleModalities.map((modality) => (
                  <TableRow key={modality.id}>
                    <TableTd>{modality.name}</TableTd>
                    <TableTd className="font-mono text-xs text-text-muted">{modality.fee.toFixed(2)}</TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton onClick={() => openEditDialog(modality)} aria-label={`Editar ${modality.name}`}>
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        <IconButton
                          tone="danger"
                          onClick={() => setDeletingModality(modality)}
                          aria-label={`Eliminar ${modality.name}`}
                        >
                          <TrashIcon size={16} />
                        </IconButton>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={3} message="No se encontraron modalidades para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={3}
                  message="Aún no hay modalidades registradas."
                  action={
                    <Button variant="secondary" onClick={openCreateDialog}>
                      <PlusIcon size={16} />
                      Registrar la primera
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

      <ModalityFormDialog open={formOpen} onClose={() => setFormOpen(false)} modality={editingModality} />

      <ConfirmDialog
        open={Boolean(deletingModality)}
        onClose={() => setDeletingModality(null)}
        onConfirm={confirmDelete}
        loading={deleteModality.isPending}
        title="Eliminar modalidad"
        description={
          deletingModality && (
            <>
              ¿Seguro que deseas eliminar <strong>{deletingModality.name}</strong>? Esta acción no se puede deshacer.
            </>
          )
        }
      />
    </div>
  )
}
