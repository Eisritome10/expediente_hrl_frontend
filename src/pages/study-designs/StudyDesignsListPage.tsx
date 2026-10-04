import { useMemo, useState } from 'react'
import { PencilSimpleIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteStudyDesign, useStudyDesignsList } from '@/hooks/useStudyDesigns'
import { StudyDesignFormDialog } from '@/pages/study-designs/StudyDesignFormDialog'
import { matchesStudyDesignSearch } from '@/pages/study-designs/study-design-search'
import type { StudyDesign } from '@/types/entities'

const PAGE_SIZE = 6
const SEARCH_FETCH_LIMIT = 100

export function StudyDesignsListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudyDesign, setEditingStudyDesign] = useState<StudyDesign | null>(null)
  const [deletingStudyDesign, setDeletingStudyDesign] = useState<StudyDesign | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useStudyDesignsList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteStudyDesign = useDeleteStudyDesign()

  const filteredStudyDesigns = useMemo(
    () =>
      isSearching && data ? data.data.filter((studyDesign) => matchesStudyDesignSearch(studyDesign, searchTerm)) : null,
    [isSearching, data, searchTerm],
  )

  const visibleStudyDesigns = isSearching
    ? (filteredStudyDesigns ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredStudyDesigns?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingStudyDesign(null)
    setFormOpen(true)
  }

  const openEditDialog = (studyDesign: StudyDesign) => {
    setEditingStudyDesign(studyDesign)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingStudyDesign) return
    await deleteStudyDesign.mutateAsync(deletingStudyDesign.id)
    setDeletingStudyDesign(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Diseños de estudio</h1>
          <p className="text-sm text-text-muted">Catálogo de diseños de estudio registrados en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nuevo diseño de estudio
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por nombre..."
        aria-label="Buscar diseño de estudio"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de diseños de estudio. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>Nombre</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={2} />
              ) : visibleStudyDesigns.length > 0 ? (
                visibleStudyDesigns.map((studyDesign) => (
                  <TableRow key={studyDesign.id}>
                    <TableTd>{studyDesign.name}</TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton onClick={() => openEditDialog(studyDesign)} aria-label={`Editar ${studyDesign.name}`}>
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        <IconButton
                          tone="danger"
                          onClick={() => setDeletingStudyDesign(studyDesign)}
                          aria-label={`Eliminar ${studyDesign.name}`}
                        >
                          <TrashIcon size={16} />
                        </IconButton>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={2} message="No se encontraron diseños de estudio para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={2}
                  message="Aún no hay diseños de estudio registrados."
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

      <StudyDesignFormDialog open={formOpen} onClose={() => setFormOpen(false)} studyDesign={editingStudyDesign} />

      <ConfirmDialog
        open={Boolean(deletingStudyDesign)}
        onClose={() => setDeletingStudyDesign(null)}
        onConfirm={confirmDelete}
        loading={deleteStudyDesign.isPending}
        title="Eliminar diseño de estudio"
        description={
          deletingStudyDesign && (
            <>
              ¿Seguro que deseas eliminar <strong>{deletingStudyDesign.name}</strong>? Esta acción no se puede deshacer.
            </>
          )
        }
      />
    </div>
  )
}
