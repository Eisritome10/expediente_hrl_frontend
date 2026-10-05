import { useState } from 'react'
import { PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  useCreateInstitutionFaculty,
  useDeleteInstitutionFaculty,
  useInstitutionFaculties,
} from '@/hooks/useInstitutions'
import { getInstitutionErrorMessage } from '@/pages/institutions/institution-error-messages'

/**
 * Facultades de una universidad, cargadas a mano. Cada universidad tiene las suyas: se guardan como registros
 * independientes (la misma facultad puede existir en varias universidades).
 *
 * - Universidad nueva (`institutionId` nulo): los nombres son un borrador que el formulario guarda después de crearla.
 * - Universidad existente: cada alta o baja se guarda al instante.
 */
export function UniversityFacultiesEditor({
  institutionId,
  drafts,
  onDraftsChange,
}: {
  institutionId: string | null
  drafts: string[]
  onDraftsChange: (names: string[]) => void
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const faculties = useInstitutionFaculties(institutionId)
  const createFaculty = useCreateInstitutionFaculty()
  const deleteFaculty = useDeleteInstitutionFaculty()

  const persisted = institutionId ? (faculties.data ?? []) : []
  const existingNames = [...persisted.map((faculty) => faculty.name), ...drafts].map((value) => value.trim().toUpperCase())

  const add = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (existingNames.includes(trimmed.toUpperCase())) {
      setError('Esa facultad ya está en la lista de esta universidad.')
      return
    }
    setError(null)

    if (!institutionId) {
      onDraftsChange([...drafts, trimmed])
      setName('')
      return
    }

    try {
      await createFaculty.mutateAsync({ institutionId, payload: { name: trimmed } })
      setName('')
    } catch (e) {
      setError(getInstitutionErrorMessage(e))
    }
  }

  const removeDraft = (index: number) => onDraftsChange(drafts.filter((_, current) => current !== index))

  const removePersisted = async (facultyId: string) => {
    if (!institutionId) return
    try {
      await deleteFaculty.mutateAsync({ institutionId, facultyId })
    } catch {
      // El error ya se muestra con un aviso (onError del hook).
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted/60 p-4">
      <legend className="px-1 text-sm font-semibold text-text">Facultades de la universidad</legend>
      <p className="text-xs text-text-muted">
        Cada universidad tiene sus propias facultades. Escribe el nombre y agrégala; puedes dejar la lista vacía y
        completarla después.
      </p>

      <div className="flex gap-2">
        <Input
          aria-label="Nombre de la facultad"
          placeholder="Ej. Medicina Humana"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => {
            // Enter agrega la facultad sin enviar el formulario de la institución.
            if (event.key === 'Enter') {
              event.preventDefault()
              void add()
            }
          }}
          error={error ?? undefined}
        />
        <Button type="button" variant="secondary" onClick={() => void add()} loading={createFaculty.isPending} className="shrink-0">
          <PlusIcon size={16} />
          Agregar
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {institutionId && faculties.isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      ) : persisted.length === 0 && drafts.length === 0 ? (
        <p className="text-sm text-text-muted">Aún no hay facultades registradas para esta universidad.</p>
      ) : (
        <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
          {drafts.map((draft, index) => (
            <li key={`draft-${draft}-${index}`} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-1.5 text-sm">
              <span>{draft}</span>
              <button
                type="button"
                onClick={() => removeDraft(index)}
                aria-label={`Quitar ${draft}`}
                className="flex size-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-red-700"
              >
                <XIcon size={14} />
              </button>
            </li>
          ))}
          {persisted.map((faculty) => (
            <li key={faculty.id} className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-1.5 text-sm">
              <span>{faculty.name}</span>
              {confirmingId === faculty.id ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-text-muted">¿Eliminar?</span>
                  <Button type="button" variant="ghost" className="px-2 py-1 text-xs" onClick={() => setConfirmingId(null)}>
                    No
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-600 px-2 py-1 text-xs hover:bg-red-700"
                    loading={deleteFaculty.isPending}
                    onClick={() => void removePersisted(faculty.id)}
                  >
                    Sí
                  </Button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingId(faculty.id)}
                  aria-label={`Eliminar ${faculty.name}`}
                  className="flex size-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-red-700"
                >
                  <TrashIcon size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}
