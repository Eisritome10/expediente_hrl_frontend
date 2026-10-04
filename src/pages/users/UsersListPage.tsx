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
import { useDeleteUser, useUsersList } from '@/hooks/useUsers'
import { UserFormDialog } from '@/pages/users/UserFormDialog'
import { matchesUserSearch } from '@/pages/users/user-search'
import type { User } from '@/types/entities'

const PAGE_SIZE = 6
const SEARCH_FETCH_LIMIT = 100

export function UsersListPage() {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isSearching = searchTerm.trim().length > 0

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchPage(1)
  }

  const { data, isPending, isError } = useUsersList(
    isSearching ? { page: 1, limit: SEARCH_FETCH_LIMIT } : { page, limit: PAGE_SIZE },
  )
  const deleteUser = useDeleteUser()

  const filteredUsers = useMemo(
    () => (isSearching && data ? data.data.filter((user) => matchesUserSearch(user, searchTerm)) : null),
    [isSearching, data, searchTerm],
  )

  const visibleUsers = isSearching
    ? (filteredUsers ?? []).slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE)
    : (data?.data ?? [])

  const paginationMeta = isSearching
    ? { page: searchPage, limit: PAGE_SIZE, total: filteredUsers?.length ?? 0 }
    : data?.meta

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingUser) return
    await deleteUser.mutateAsync(deletingUser.id)
    setDeletingUser(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text">Usuarios</h1>
          <p className="text-sm text-text-muted">Cuentas de acceso al panel administrativo.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon size={16} />
          Nuevo usuario
        </Button>
      </div>

      <SearchInput
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por usuario, nombre o correo..."
        aria-label="Buscar usuario"
      />

      {isError ? (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningCircleIcon size={18} className="shrink-0" />
          No se pudo cargar la lista de usuarios. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableTh>Usuario</TableTh>
              <TableTh>Nombre completo</TableTh>
              <TableTh>Rol</TableTh>
              <TableTh>Estado</TableTh>
              <TableTh className="text-right">Acciones</TableTh>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={5} />
              ) : visibleUsers.length > 0 ? (
                visibleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableTd className="font-mono text-xs">{user.username}</TableTd>
                    <TableTd>{user.fullName}</TableTd>
                    <TableTd>
                      {user.role === 'ADMIN' ? (
                        <Badge tone="brand">Administrador</Badge>
                      ) : (
                        <Badge tone="neutral">Investigador</Badge>
                      )}
                    </TableTd>
                    <TableTd>
                      {user.status === 'ACTIVE' ? (
                        <Badge tone="success">Activo</Badge>
                      ) : (
                        <Badge tone="danger">Inactivo</Badge>
                      )}
                    </TableTd>
                    <TableTd>
                      <div className="flex justify-end gap-1.5">
                        <IconButton onClick={() => openEditDialog(user)} aria-label={`Editar ${user.username}`}>
                          <PencilSimpleIcon size={16} />
                        </IconButton>
                        {!user.researcherId && (
                          <IconButton
                            tone="danger"
                            onClick={() => setDeletingUser(user)}
                            aria-label={`Eliminar ${user.username}`}
                          >
                            <TrashIcon size={16} />
                          </IconButton>
                        )}
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              ) : isSearching ? (
                <TableEmptyState colSpan={5} message="No se encontraron usuarios para esa búsqueda." />
              ) : (
                <TableEmptyState
                  colSpan={5}
                  message="Aún no hay usuarios registrados."
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

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} user={editingUser} />

      <ConfirmDialog
        open={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        loading={deleteUser.isPending}
        title="Eliminar usuario"
        description={
          deletingUser && (
            <>
              ¿Seguro que deseas eliminar la cuenta <strong>{deletingUser.username}</strong>? Esta acción no se puede
              deshacer.
            </>
          )
        }
      />
    </div>
  )
}
