import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardTextIcon, FunnelIcon, LinkBreakIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TableBody, TableHead, TableRow, TableSkeletonRows, TableTd, TableTh } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useMyProtocolsList } from '@/hooks/useProtocols'
import { RESEARCHER_STATUSES, RESEARCHER_STATUS_CONFIG, RESEARCHER_STATUS_HINT } from '@/pages/protocols/protocol-status'
import { ProtocolStatusBadge } from '@/pages/protocols/ProtocolStatusBadge'
import { ApiError } from '@/types/common'
import type { ProtocolStatus, ProtocolSummary } from '@/types/entities'

const PAGE_SIZE = 8
const FETCH_ALL_LIMIT = 100

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function matchesSearch(protocol: ProtocolSummary, term: string) {
  const query = normalize(term)
  if (!query) return true
  const principal = `${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}`
  return (
    normalize(protocol.nroExpediente).includes(query) ||
    normalize(protocol.titulo).includes(query) ||
    normalize(principal).includes(query)
  )
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function MyProtocolsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<ProtocolStatus | ''>('')

  const searchTerm = useDebouncedValue(searchInput, 300)
  const isFiltering = searchTerm.trim().length > 0 || status !== ''

  // El endpoint solo pagina; para buscar o filtrar se trae el conjunto completo y se filtra aquí.
  const { data, isPending, isError, error } = useMyProtocolsList({
    page: isFiltering ? 1 : page,
    limit: isFiltering ? FETCH_ALL_LIMIT : PAGE_SIZE,
  })

  const filtered = useMemo(
    () =>
      isFiltering && data
        ? data.data.filter((protocol) => (!status || protocol.status === status) && matchesSearch(protocol, searchTerm))
        : null,
    [isFiltering, data, status, searchTerm],
  )

  const visible = isFiltering ? (filtered ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : (data?.data ?? [])
  const meta = isFiltering ? { page, limit: PAGE_SIZE, total: filtered?.length ?? 0 } : data?.meta

  const resetPage = () => setPage(1)
  const isNotLinked = error instanceof ApiError && error.body?.errorCode === 'RESEARCHER_ACCOUNT_NOT_LINKED'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Mis protocolos</h1>
        <p className="mt-1 max-w-prose text-sm text-text-muted">
          Protocolos en los que participas como investigador principal, coinvestigador o asesor, con su estado actual.
        </p>
      </div>

      {isNotLinked ? (
        <NoticePanel
          icon={<LinkBreakIcon size={28} />}
          title="Tu cuenta aún no está vinculada a un investigador"
          body="Comunícate con la oficina de investigación para que vinculen tu cuenta a tu registro de investigador."
        />
      ) : isError ? (
        <div role="alert" className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <WarningCircleIcon size={18} weight="fill" className="shrink-0 text-red-600" aria-hidden />
          No se pudo cargar tu lista de protocolos. Verifica tu conexión e intenta nuevamente.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value)
                resetPage()
              }}
              onClear={() => {
                setSearchInput('')
                resetPage()
              }}
              placeholder="Buscar por expediente, título o investigador"
              aria-label="Buscar protocolo"
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <FunnelIcon size={16} className="text-text-muted" aria-hidden />
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as ProtocolStatus | '')
                  resetPage()
                }}
                aria-label="Filtrar por estado"
                className="w-52"
              >
                <option value="">Todos los estados</option>
                {RESEARCHER_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {RESEARCHER_STATUS_CONFIG[value].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {!isPending && visible.length === 0 ? (
            isFiltering ? (
              <NoticePanel
                icon={<ClipboardTextIcon size={28} />}
                title="Ningún protocolo coincide"
                body="Prueba con otro término de búsqueda o quita el filtro de estado."
              />
            ) : (
              <NoticePanel
                icon={<ClipboardTextIcon size={28} />}
                title="Aún no participas en ningún protocolo"
                body="Cuando la oficina de investigación te registre como parte de un protocolo, aparecerá en esta lista con su estado."
              />
            )
          ) : (
            <>
              {/* Pantallas angostas: una fila apilada por protocolo en lugar de una tabla que desborda. */}
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface md:hidden">
                {isPending
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <li key={index} className="flex flex-col gap-2 p-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </li>
                    ))
                  : visible.map((protocol) => (
                      <li
                        key={protocol.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate(`/mis-protocolos/${protocol.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            navigate(`/mis-protocolos/${protocol.id}`)
                          }
                        }}
                        aria-label={`Ver protocolo ${protocol.nroExpediente}`}
                        className="flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-surface-muted/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-text">{protocol.nroExpediente}</span>
                          <ProtocolStatusBadge status={protocol.status} audience="researcher" />
                        </div>
                        <p className="text-sm text-text">{protocol.titulo}</p>
                        <p className="text-xs text-text-muted">{RESEARCHER_STATUS_HINT[protocol.status]}</p>
                        <p className="text-xs text-text-muted">
                          {protocol.investigadorPrincipal.firstName} {protocol.investigadorPrincipal.lastName}
                          {' / '}
                          {formatDate(protocol.fechaRecepcion)}
                        </p>
                      </li>
                    ))}
              </ul>

              <div className="hidden md:block">
                <Table>
                  <TableHead>
                    <TableTh>Expediente</TableTh>
                    <TableTh>Título</TableTh>
                    <TableTh>Estado</TableTh>
                    <TableTh>Investigador principal</TableTh>
                    <TableTh>Recepción</TableTh>
                  </TableHead>
                  <TableBody>
                    {isPending ? (
                      <TableSkeletonRows rows={PAGE_SIZE} columns={5} />
                    ) : (
                      visible.map((protocol) => (
                        <TableRow
                          key={protocol.id}
                          role="link"
                          tabIndex={0}
                          onClick={() => navigate(`/mis-protocolos/${protocol.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              navigate(`/mis-protocolos/${protocol.id}`)
                            }
                          }}
                          aria-label={`Ver protocolo ${protocol.nroExpediente}`}
                          className="cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none"
                        >
                          <TableTd className="font-semibold whitespace-nowrap">{protocol.nroExpediente}</TableTd>
                          <TableTd className="max-w-xs">
                            <span className="line-clamp-2">{protocol.titulo}</span>
                          </TableTd>
                          <TableTd className="max-w-56">
                            <div className="flex flex-col items-start gap-1">
                              <ProtocolStatusBadge status={protocol.status} audience="researcher" />
                              <span className="text-xs text-text-muted">{RESEARCHER_STATUS_HINT[protocol.status]}</span>
                            </div>
                          </TableTd>
                          <TableTd className="text-text-muted">
                            {protocol.investigadorPrincipal.firstName} {protocol.investigadorPrincipal.lastName}
                          </TableTd>
                          <TableTd className="whitespace-nowrap text-text-muted">{formatDate(protocol.fechaRecepcion)}</TableTd>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {meta && meta.total > 0 && <Pagination meta={meta} onPageChange={setPage} />}
            </>
          )}
        </>
      )}
    </div>
  )
}

function NoticePanel({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">{icon}</span>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <p className="max-w-sm text-sm text-text-muted">{body}</p>
    </div>
  )
}
