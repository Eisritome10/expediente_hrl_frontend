import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { BuildingsIcon } from '@phosphor-icons/react'
import { FormField, Input, Textarea } from '@/components/ui/Input'
import { MultiCombobox, type ComboboxOption } from '@/components/ui/MultiCombobox'
import { Switch } from '@/components/ui/Switch'
import { useDestinationsList } from '@/hooks/useDestinations'
import { useInstitutionsList } from '@/hooks/useInstitutions'
import { normalizeAlnum, type ProtocolFormValues } from '@/schemas/protocol.schema'

const CATALOG_LIMIT = 100

export function ExpedienteStep() {
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const esInstitucional = watch('esInstitucional')

  const institutions = useInstitutionsList({ page: 1, limit: CATALOG_LIMIT })
  const destinations = useDestinationsList({ page: 1, limit: CATALOG_LIMIT })

  const hospitalRegional = institutions.data?.data.find((institution) =>
    normalizeAlnum(institution.name).includes('hospitalregional'),
  )

  const destinationOptions: ComboboxOption[] = (destinations.data?.data ?? []).map((destination) => ({
    id: destination.id,
    label: destination.description,
  }))

  useEffect(() => {
    if (esInstitucional && hospitalRegional) {
      setValue('lugarEjecucion', hospitalRegional.name, { shouldValidate: true })
    }
  }, [esInstitucional, hospitalRegional, setValue])

  const handleInstitucionalChange = (checked: boolean) => {
    setValue('esInstitucional', checked, { shouldValidate: true })
    if (checked) {
      setValue('lugarEjecucion', hospitalRegional?.name ?? 'HOSPITAL REGIONAL DE LORETO', { shouldValidate: true })
    } else {
      setValue('lugarEjecucion', '', { shouldValidate: true })
      setValue('destinoIds', [], { shouldValidate: true })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">Datos generales del expediente que se está recibiendo.</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="N° de expediente" htmlFor="nroExpediente" error={errors.nroExpediente?.message} required>
          <Input
            id="nroExpediente"
            autoFocus
            placeholder="542/2026"
            error={errors.nroExpediente?.message}
            {...register('nroExpediente')}
          />
        </FormField>

        <FormField label="Fecha de recepción" htmlFor="fechaRecepcion" error={errors.fechaRecepcion?.message} required>
          <Input id="fechaRecepcion" type="date" error={errors.fechaRecepcion?.message} {...register('fechaRecepcion')} />
        </FormField>
      </div>

      <FormField label="Título del proyecto" htmlFor="titulo" error={errors.titulo?.message} required>
        <Textarea id="titulo" placeholder="Título completo del proyecto de investigación" error={errors.titulo?.message} {...register('titulo')} />
      </FormField>

      <FormField label="Diseño del estudio" htmlFor="disenoEstudio" error={errors.disenoEstudio?.message} required>
        <Input
          id="disenoEstudio"
          placeholder="Descriptivo transversal"
          error={errors.disenoEstudio?.message}
          {...register('disenoEstudio')}
        />
      </FormField>

      <Switch
        checked={esInstitucional}
        onChange={handleInstitucionalChange}
        label="Proyecto institucional"
        description={
          esInstitucional
            ? 'Se ejecuta dentro del Hospital Regional de Loreto. Los memos (destinos) aplican.'
            : 'Se ejecuta fuera del Hospital Regional de Loreto. Los memos (destinos) no aplican.'
        }
      />

      {esInstitucional ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted/60 px-3.5 py-2.5 text-sm text-text">
          <BuildingsIcon size={16} className="shrink-0 text-brand-600" />
          Lugar de ejecución: <span className="font-medium">{hospitalRegional?.name ?? 'HOSPITAL REGIONAL DE LORETO'}</span>
        </div>
      ) : (
        <FormField label="Lugar de ejecución" htmlFor="lugarEjecucion" error={errors.lugarEjecucion?.message} required>
          <Input
            id="lugarEjecucion"
            placeholder="Nombre de la institución externa"
            error={errors.lugarEjecucion?.message}
            {...register('lugarEjecucion')}
          />
        </FormField>
      )}

      {esInstitucional && (
        <FormField label="Destinos (memos)" htmlFor="destinoIds">
          <Controller
            name="destinoIds"
            control={control}
            render={({ field }) => (
              <MultiCombobox
                options={destinationOptions}
                value={field.value}
                onChange={field.onChange}
                loading={destinations.isPending}
                placeholder="Agregar destino (opcional)"
                label="destinos"
              />
            )}
          />
        </FormField>
      )}
    </div>
  )
}
