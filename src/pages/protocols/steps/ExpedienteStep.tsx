import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Controller, useFormContext } from 'react-hook-form'
import { BuildingsIcon } from '@phosphor-icons/react'
import { FormField, Input, Textarea } from '@/components/ui/Input'
import { MultiCombobox, type ComboboxOption } from '@/components/ui/MultiCombobox'
import { Switch } from '@/components/ui/Switch'
import { useDestinationsList } from '@/hooks/useDestinations'
import { useInstitutionsList } from '@/hooks/useInstitutions'
import { useStudyDesignsList } from '@/hooks/useStudyDesigns'
import { StudyDesignFormDialog } from '@/pages/study-designs/StudyDesignFormDialog'
import { DestinationFormDialog } from '@/pages/destinations/DestinationFormDialog'
import { normalizeAlnum, type ProtocolFormValues } from '@/schemas/protocol.schema'

const CATALOG_LIMIT = 100

function formatNumeroExpediente(value: string): string {
  return value.replace(/\D/g, '').slice(0, 5)
}

export function ExpedienteStep() {
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const [openStudyDesignDialog, setOpenStudyDesignDialog] = useState(false)
  const [openDestinationDialog, setOpenDestinationDialog] = useState(false)

  const esInstitucional = watch('esInstitucional')
  const numeroExpediente = watch('numeroExpediente')

  const institutions = useInstitutionsList({ page: 1, limit: CATALOG_LIMIT })
  const destinations = useDestinationsList({ page: 1, limit: CATALOG_LIMIT })
  const studyDesigns = useStudyDesignsList({ page: 1, limit: CATALOG_LIMIT })

  const hospitalRegional = institutions.data?.data.find((institution) =>
    normalizeAlnum(institution.name).includes('hospitalregional'),
  )

  const destinationOptions: ComboboxOption[] = (destinations.data?.data ?? []).map((destination) => ({
    id: destination.id,
    label: destination.description,
  }))

  const studyDesignOptions: ComboboxOption[] = (studyDesigns.data?.data ?? []).map((studyDesign) => ({
    id: studyDesign.id,
    label: studyDesign.name,
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
        <FormField
          label="N° de expediente"
          htmlFor="numeroExpediente"
          hint={
            numeroExpediente
              ? `Se registrará como ${numeroExpediente}/${new Date().getFullYear()}`
              : 'Solo el número correlativo; el año se agrega automáticamente.'
          }
          error={errors.numeroExpediente?.message}
          required
        >
          <Input
            id="numeroExpediente"
            autoFocus
            inputMode="numeric"
            maxLength={5}
            placeholder="542"
            error={errors.numeroExpediente?.message}
            {...register('numeroExpediente', {
              onChange: (e) => {
                e.target.value = formatNumeroExpediente(e.target.value)
              },
            })}
          />
        </FormField>

        <FormField label="Fecha de recepción" htmlFor="fechaRecepcion" error={errors.fechaRecepcion?.message} required>
          <Input id="fechaRecepcion" type="date" error={errors.fechaRecepcion?.message} {...register('fechaRecepcion')} />
        </FormField>
      </div>

      <FormField label="Título del proyecto" htmlFor="titulo" error={errors.titulo?.message} required>
        <Textarea id="titulo" placeholder="Título completo del proyecto de investigación" error={errors.titulo?.message} {...register('titulo')} />
      </FormField>

      <FormField label="Diseño del estudio" htmlFor="studyDesignIds" error={errors.studyDesignIds?.message} required>
        <Controller
          name="studyDesignIds"
          control={control}
          render={({ field }) => (
            <MultiCombobox
              options={studyDesignOptions}
              value={field.value}
              onChange={field.onChange}
              loading={studyDesigns.isPending}
              placeholder="Agregar diseño de estudio"
              label="diseños de estudio"
              onCreateNew={() => setOpenStudyDesignDialog(true)}
            />
          )}
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
          <BuildingsIcon size={16} className="shrink-0 text-brand-700" />
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
                onCreateNew={() => setOpenDestinationDialog(true)}
              />
            )}
          />
        </FormField>
      )}

      {createPortal(
        <>
          <StudyDesignFormDialog open={openStudyDesignDialog} onClose={() => setOpenStudyDesignDialog(false)} studyDesign={null} />
          <DestinationFormDialog open={openDestinationDialog} onClose={() => setOpenDestinationDialog(false)} destination={null} />
        </>,
        document.body,
      )}
    </div>
  )
}
