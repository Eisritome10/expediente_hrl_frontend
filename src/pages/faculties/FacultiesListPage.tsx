import { useMemo, useState } from 'react'
import { PencilSimpleIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteFaculty, useFacultiesList } from '@/hooks/useFaculties'
import { FacultyFormDialog } from '@/pages/faculties/FacultyFormDialog'
import { matchesFacultySearch } from '@/pages/faculties/faculty-search'
import type { Faculty } from '@/types/entities'

const PAGE_SIZE = 10
const SEARCH_FETCH_LIMIT = 100

export function FacultiesListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useFacultiesList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteFaculty = useDeleteFaculty()

  const filteredFaculties = useMemo(
    () => (isSearching && data ? data.data.filter((faculty) => matchesFacultySearch(faculty, searchTerm)) : null),
    [isSearching, data, searchTerm],
  )

  const visibleFaculties = isSearching
    ? (filteredFaculties ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredFaculties?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingFaculty(null)
    setFormOpen(true)
  }

  const openEditDialog = (faculty: Faculty) => {
    setEditingFaculty(faculty)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingFaculty) return
    await deleteFaculty.mutateAsync(deletingFaculty.id)
    setDeletingFaculty(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Facultades</h1>
          <p className="text-sm text-text-muted">Catálogo de facultades registradas en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nueva facultad
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por nombre..."
        aria-label="Buscar facultad"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de facultades. Verifica tu conexión e intenta nuevamente.
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
              ) : visibleFaculties.length > 0 ? (
                visibleFaculties.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableTd>{faculty.name}</TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton onClick={() => openEditDialog(faculty)} aria-label={`Editar ${faculty.name}`}>
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        <IconButton
                          tone="danger"
                          onClick={() => setDeletingFaculty(faculty)}
                          aria-label={`Eliminar ${faculty.name}`}
                        >
                          <TrashIcon size={16} />
                        </IconButton>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={2} message="No se encontraron facultades para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={2}
                  message="Aún no hay facultades registradas."
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

      <FacultyFormDialog open={formOpen} onClose={() => setFormOpen(false)} faculty={editingFaculty} />

      <ConfirmDialog
        open={Boolean(deletingFaculty)}
        onClose={() => setDeletingFaculty(null)}
        onConfirm={confirmDelete}
        loading={deleteFaculty.isPending}
        title="Eliminar facultad"
        description={
          deletingFaculty && (
            <>
              ¿Seguro que deseas eliminar <strong>{deletingFaculty.name}</strong>? Esta acción no se puede deshacer.
            </>
          )
        }
      />
    </div>
  )
}
