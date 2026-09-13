import { useMemo, useState } from 'react'
import { PencilSimpleIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteInstitution, useInstitutionsList } from '@/hooks/useInstitutions'
import { InstitutionFormDialog } from '@/pages/institutions/InstitutionFormDialog'
import { matchesInstitutionSearch } from '@/pages/institutions/institution-search'
import type { Institution } from '@/types/entities'

const PAGE_SIZE = 10
const SEARCH_FETCH_LIMIT = 100

export function InstitutionsListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null)
  const [deletingInstitution, setDeletingInstitution] = useState<Institution | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useInstitutionsList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteInstitution = useDeleteInstitution()

  const filteredInstitutions = useMemo(
    () => (isSearching && data ? data.data.filter((institution) => matchesInstitutionSearch(institution, searchTerm)) : null),
    [isSearching, data, searchTerm],
  )

  const visibleInstitutions = isSearching
    ? (filteredInstitutions ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredInstitutions?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingInstitution(null)
    setFormOpen(true)
  }

  const openEditDialog = (institution: Institution) => {
    setEditingInstitution(institution)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingInstitution) return
    await deleteInstitution.mutateAsync(deletingInstitution.id)
    setDeletingInstitution(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Instituciones</h1>
          <p className="text-sm text-text-muted">Catálogo de instituciones aliadas registradas en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nueva institución
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por nombre o abreviatura..."
        aria-label="Buscar institución"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de instituciones. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>Nombre</TableTh>
              <TableTh>Abreviatura</TableTh>
              <TableTh>Tipo</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={4} />
              ) : visibleInstitutions.length > 0 ? (
                visibleInstitutions.map((institution) => (
                  <TableRow key={institution.id}>
                    <TableTd>{institution.name}</TableTd>
                    <TableTd className="text-text-muted">{institution.abbreviation ?? '-'}</TableTd>
                    <TableTd>
                      {institution.esUniversidad ? (
                        <Badge tone="brand">Universidad</Badge>
                      ) : (
                        <Badge tone="neutral">Institución</Badge>
                      )}
                    </TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton onClick={() => openEditDialog(institution)} aria-label={`Editar ${institution.name}`}>
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        <IconButton
                          tone="danger"
                          onClick={() => setDeletingInstitution(institution)}
                          aria-label={`Eliminar ${institution.name}`}
                        >
                          <TrashIcon size={16} />
                        </IconButton>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={4} message="No se encontraron instituciones para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={4}
                  message="Aún no hay instituciones registradas."
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

      <InstitutionFormDialog open={formOpen} onClose={() => setFormOpen(false)} institution={editingInstitution} />

      <ConfirmDialog
        open={Boolean(deletingInstitution)}
        onClose={() => setDeletingInstitution(null)}
        onConfirm={confirmDelete}
        loading={deleteInstitution.isPending}
        title="Eliminar institución"
        description={
          deletingInstitution && (
            <>
              ¿Seguro que deseas eliminar <strong>{deletingInstitution.name}</strong>? Esta acción no se puede deshacer.
            </>
          )
        }
      />
    </div>
  )
}
