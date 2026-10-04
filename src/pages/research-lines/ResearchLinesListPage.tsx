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
import { useDeleteResearchLine, useResearchLinesList } from '@/hooks/useResearchLines'
import { ResearchLineFormDialog } from '@/pages/research-lines/ResearchLineFormDialog'
import { lineTypeLabels, matchesResearchLineSearch } from '@/pages/research-lines/research-line-search'
import type { ResearchLine } from '@/types/entities'

const PAGE_SIZE = 6
const SEARCH_FETCH_LIMIT = 100

export function ResearchLinesListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingResearchLine, setEditingResearchLine] = useState<ResearchLine | null>(null)
  const [deletingResearchLine, setDeletingResearchLine] = useState<ResearchLine | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useResearchLinesList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteResearchLine = useDeleteResearchLine()

  const filteredResearchLines = useMemo(
    () =>
      isSearching && data
        ? data.data.filter((researchLine) => matchesResearchLineSearch(researchLine, searchTerm))
        : null,
    [isSearching, data, searchTerm],
  )

  const visibleResearchLines = isSearching
    ? (filteredResearchLines ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredResearchLines?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingResearchLine(null)
    setFormOpen(true)
  }

  const openEditDialog = (researchLine: ResearchLine) => {
    setEditingResearchLine(researchLine)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingResearchLine) return
    await deleteResearchLine.mutateAsync(deletingResearchLine.id)
    setDeletingResearchLine(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Líneas de investigación</h1>
          <p className="text-sm text-text-muted">Catálogo de líneas de investigación registradas en el sistema.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nueva línea
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por nombre o tipo..."
        aria-label="Buscar línea de investigación"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de líneas de investigación. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>Nombre</TableTh>
              <TableTh>Tipo</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={3} />
              ) : visibleResearchLines.length > 0 ? (
                visibleResearchLines.map((researchLine) => (
                  <TableRow key={researchLine.id}>
                    <TableTd>{researchLine.name}</TableTd>
                    <TableTd>
                      <Badge tone={researchLine.type === 'HRL' ? 'brand' : 'info'}>
                        {lineTypeLabels[researchLine.type]}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton
                          onClick={() => openEditDialog(researchLine)}
                          aria-label={`Editar ${researchLine.name}`}
                        >
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        <IconButton
                          tone="danger"
                          onClick={() => setDeletingResearchLine(researchLine)}
                          aria-label={`Eliminar ${researchLine.name}`}
                        >
                          <TrashIcon size={16} />
                        </IconButton>
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={3} message="No se encontraron líneas de investigación para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={3}
                  message="Aún no hay líneas de investigación registradas."
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

      <ResearchLineFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        researchLine={editingResearchLine}
      />

      <ConfirmDialog
        open={Boolean(deletingResearchLine)}
        onClose={() => setDeletingResearchLine(null)}
        onConfirm={confirmDelete}
        loading={deleteResearchLine.isPending}
        title="Eliminar línea de investigación"
        description={
          deletingResearchLine && (
            <>
              ¿Seguro que deseas eliminar <strong>{deletingResearchLine.name}</strong>? Esta acción no se puede
              deshacer.
            </>
          )
        }
      />
    </div>
  )
}
