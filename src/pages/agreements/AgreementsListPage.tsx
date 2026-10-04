import { useMemo, useState } from 'react'
import { PencilSimpleIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Table, TableBody, TableEmptyState, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteAgreement, useAgreementsList } from '@/hooks/useAgreements'
import { AgreementFormDialog } from '@/pages/agreements/AgreementFormDialog'
import { matchesAgreementSearch } from '@/pages/agreements/agreement-search'
import type { Agreement } from '@/types/entities'

const PAGE_SIZE = 6
const SEARCH_FETCH_LIMIT = 100

export function AgreementsListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null)
  const [deletingAgreement, setDeletingAgreement] = useState<Agreement | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useAgreementsList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteAgreement = useDeleteAgreement()

  const filteredAgreements = useMemo(
    () =>
      isSearching && data ? data.data.filter((agreement) => matchesAgreementSearch(agreement, searchTerm)) : null,
    [isSearching, data, searchTerm],
  )

  const visibleAgreements = isSearching
    ? (filteredAgreements ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredAgreements?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingAgreement(null)
    setFormOpen(true)
  }

  const openEditDialog = (agreement: Agreement) => {
    setEditingAgreement(agreement)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingAgreement) return
    await deleteAgreement.mutateAsync(deletingAgreement.id)
    setDeletingAgreement(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Convenios</h1>
          <p className="text-sm text-text-muted">Catálogo de convenios interinstitucionales registrados en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nuevo convenio
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por nombre de convenio..."
        aria-label="Buscar convenio"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de convenios. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>Nombre del Convenio</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={2} />
              ) : visibleAgreements.length > 0 ? (
                visibleAgreements.map((agreement) => (
                  <TableRow key={agreement.id}>
                    <TableTd>{agreement.name}</TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton onClick={() => openEditDialog(agreement)} aria-label={`Editar ${agreement.name}`}>
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        <IconButton
                          tone="danger"
                          onClick={() => setDeletingAgreement(agreement)}
                          aria-label={`Eliminar ${agreement.name}`}
                        >
                          <TrashIcon size={16} />
                        </IconButton>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={2} message="No se encontraron convenios para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={2}
                  message="Aún no hay convenios registrados."
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

      <AgreementFormDialog open={formOpen} onClose={() => setFormOpen(false)} agreement={editingAgreement} />

      <ConfirmDialog
        open={Boolean(deletingAgreement)}
        onClose={() => setDeletingAgreement(null)}
        onConfirm={confirmDelete}
        loading={deleteAgreement.isPending}
        title="Eliminar convenio"
        description={
          deletingAgreement && (
            <>
              ¿Seguro que deseas eliminar el convenio <strong>{deletingAgreement.name}</strong>? Esta acción no se puede
              deshacer.
            </>
          )
        }
      />
    </div>
  )
}
