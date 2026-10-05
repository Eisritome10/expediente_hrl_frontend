import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { RadioCardGroup, type RadioCardOption } from '@/components/ui/RadioCardGroup'
import { SearchInput } from '@/components/ui/SearchInput'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useProtocol, useProtocolsList } from '@/hooks/useProtocols'
import {
  protocolFormDefaultValues,
  protocolToAmendmentFormValues,
  type ProtocolFormValues,
} from '@/schemas/protocol.schema'

type TipoRegistro = 'nuevo' | 'enmienda'

const OPTIONS: RadioCardOption<TipoRegistro>[] = [
  {
    value: 'nuevo',
    label: 'Nuevo protocolo',
    description: 'Registra un expediente que ingresa por primera vez al proceso.',
  },
  {
    value: 'enmienda',
    label: 'Enmienda de un protocolo finalizado',
    description:
      'Reabre los datos de un protocolo ya finalizado. La enmienda queda exonerada del pago de revisión.',
  },
]

export function TipoRegistroStep() {
  const {
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const esEnmienda = watch('esEnmienda')
  const protocoloOriginalId = watch('protocoloOriginalId')
  const { data: selectedOriginal } = useProtocol(esEnmienda && protocoloOriginalId ? protocoloOriginalId : null)

  const handleChange = (value: TipoRegistro) => {
    if (value === 'nuevo') {
      // Volver a "Nuevo protocolo" parte de cero y descarta la precarga de la enmienda.
      reset(protocolFormDefaultValues)
      return
    }
    setValue('esEnmienda', true, { shouldValidate: true })
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">
        Elige si registras un protocolo nuevo o una enmienda de uno ya finalizado.
      </p>

      <RadioCardGroup
        legend="Tipo de registro"
        value={esEnmienda ? 'enmienda' : 'nuevo'}
        onChange={handleChange}
        options={OPTIONS}
      />

      {esEnmienda && (
        <div className="flex flex-col gap-3">
          <AmendmentPicker />
          {selectedOriginal && (
            <p className="text-sm text-text">
              Protocolo original seleccionado:{' '}
              <strong className="font-semibold">N° {selectedOriginal.nroExpediente}</strong>
            </p>
          )}
          {errors.protocoloOriginalId && (
            <p role="alert" className="text-sm text-red-700">
              {errors.protocoloOriginalId.message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function AmendmentPicker() {
  const { reset } = useFormContext<ProtocolFormValues>()
  const [term, setTerm] = useState('')
  const [pickedId, setPickedId] = useState<string | null>(null)
  const debouncedTerm = useDebouncedValue(term, 300)
  const trimmedTerm = debouncedTerm.trim()

  const { data, isPending, isError } = useProtocolsList({
    page: 1,
    limit: 10,
    nroExpediente: trimmedTerm,
    status: 'FINALIZED',
  })
  // Se carga al protocolo elegido y, una vez disponible, se precarga el formulario.
  const { data: original, isFetching } = useProtocol(pickedId)
  // Evita volver a precargar (y borrar cambios) cuando el protocolo se vuelve a buscar por refetch.
  const prefilledIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (original && prefilledIdRef.current !== original.id) {
      prefilledIdRef.current = original.id
      reset(protocolToAmendmentFormValues(original))
    }
  }, [original, reset])

  const results = trimmedTerm ? (data?.data ?? []) : []

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-strong bg-surface-muted/40 p-4">
      <div className="flex items-start gap-2.5 text-sm text-amber-900">
        <WarningCircleIcon size={18} weight="fill" className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
        <p>Si cambias el protocolo original se reemplazarán los datos del formulario con los de ese protocolo.</p>
      </div>

      <SearchInput
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
          prefilledIdRef.current = null
          setPickedId(null)
        }}
        onClear={() => {
          setTerm('')
          prefilledIdRef.current = null
          setPickedId(null)
        }}
        placeholder="Buscar por N° de expediente del protocolo finalizado"
        aria-label="Buscar protocolo finalizado"
      />

      {isFetching && <p className="text-sm text-text-muted">Cargando el protocolo original…</p>}

      {trimmedTerm && !isFetching && (
        <div className="flex flex-col gap-2">
          {isPending ? (
            <p className="text-sm text-text-muted">Buscando protocolos…</p>
          ) : isError ? (
            <p className="text-sm text-red-700">No se pudo buscar protocolos. Intenta nuevamente.</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-text-muted">No se encontraron protocolos finalizados con ese número.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {results.map((protocol) => (
                <li key={protocol.id}>
                  <button
                    type="button"
                    onClick={() => setPickedId(protocol.id)}
                    className="flex w-full flex-col gap-0.5 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-muted/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none"
                  >
                    <span className="text-sm font-semibold text-text">{protocol.nroExpediente}</span>
                    <span className="line-clamp-1 text-xs text-text-muted">{protocol.titulo}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
