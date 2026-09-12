import { useMemo, useState } from 'react'
import { PencilSimpleIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteResearcher, useResearchersList } from '@/hooks/useResearchers'
import { ResearcherFormDialog } from '@/pages/researchers/ResearcherFormDialog'
import { matchesResearcherSearch } from '@/pages/researchers/researcher-search'
import type { Researcher } from '@/types/entities'

const PAGE_SIZE = 10
const SEARCH_FETCH_LIMIT = 100

export function ResearchersListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingResearcher, setEditingResearcher] = useState<Researcher | null>(null)
  const [deletingResearcher, setDeletingResearcher] = useState<Researcher | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useResearchersList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteResearcher = useDeleteResearcher()

  const filteredResearchers = useMemo(
    () => (isSearching && data ? data.data.filter((researcher) => matchesResearcherSearch(researcher, searchTerm)) : null),
    [isSearching, data, searchTerm],
  )

  const visibleResearchers = isSearching
    ? (filteredResearchers ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredResearchers?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingResearcher(null)
    setFormOpen(true)
  }

  const openEditDialog = (researcher: Researcher) => {
    setEditingResearcher(researcher)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingResearcher) return
    await deleteResearcher.mutateAsync(deletingResearcher.id)
    setDeletingResearcher(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Investigadores</h1>
          <p className="text-sm text-text-muted">Catálogo de investigadores registrados en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nuevo investigador
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por DNI, nombre, correo o teléfono..."
        aria-label="Buscar investigador"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de investigadores. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>DNI</TableTh>
              <TableTh>Nombre completo</TableTh>
              <TableTh>Correo</TableTh>
              <TableTh>Teléfono</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={5} />
              ) : visibleResearchers.length > 0 ? (
                visibleResearchers.map((researcher) => (
                  <TableRow key={researcher.id}>
                    <TableTd className="font-mono text-xs">{researcher.dni}</TableTd>
                    <TableTd>
                      {researcher.firstName} {researcher.lastName}
                    </TableTd>
                    <TableTd className="text-text-muted">{researcher.email ?? '-'}</TableTd>
                    <TableTd className="text-text-muted">{researcher.phone ?? '-'}</TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditDialog(researcher)}
                          aria-label={`Editar ${researcher.firstName} ${researcher.lastName}`}
                          className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted hover:text-text"
                        >
                          <PencilSimpleIcon size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingResearcher(researcher)}
                          aria-label={`Eliminar ${researcher.firstName} ${researcher.lastName}`}
                          className="rounded-md p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={5} message="No se encontraron investigadores para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={5}
                  message="Aún no hay investigadores registrados."
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

      <ResearcherFormDialog open={formOpen} onClose={() => setFormOpen(false)} researcher={editingResearcher} />

      <ConfirmDialog
        open={Boolean(deletingResearcher)}
        onClose={() => setDeletingResearcher(null)}
        onConfirm={confirmDelete}
        loading={deleteResearcher.isPending}
        title="Eliminar investigador"
        description={
          deletingResearcher && (
            <>
              ¿Seguro que deseas eliminar a <strong>{deletingResearcher.firstName} {deletingResearcher.lastName}</strong>?
              Esta acción no se puede deshacer.
            </>
          )
        }
      />
    </div>
  )
}
