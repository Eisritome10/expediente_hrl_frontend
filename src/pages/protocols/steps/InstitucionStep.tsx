import { useEffect } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { FormField } from '@/components/ui/Input'
import { useInstitutionFaculties, useInstitutionsList } from '@/hooks/useInstitutions'
import { useModalitiesList } from '@/hooks/useModalities'
import { cn } from '@/lib/cn'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

const CATALOG_LIMIT = 100

export function InstitucionStep() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const institucionId = useWatch<ProtocolFormValues, 'institucionId'>({ control, name: 'institucionId' })
  const esInstitucional = useWatch<ProtocolFormValues, 'esInstitucional'>({ control, name: 'esInstitucional' })
  const modalidadId = useWatch<ProtocolFormValues, 'modalidadId'>({ control, name: 'modalidadId' })

  const institutions = useInstitutionsList({ page: 1, limit: CATALOG_LIMIT })
  const modalities = useModalitiesList({ page: 1, limit: CATALOG_LIMIT })

  const selectedInstitution = institutions.data?.data.find((institution) => institution.id === institucionId)
  const facultadEnabled = selectedInstitution?.type === 'UNIVERSITY'
  // Cada universidad tiene sus propias facultades: solo se cargan las de la universidad elegida.
  const faculties = useInstitutionFaculties(institucionId || null, { enabled: facultadEnabled })

  const institutionOptions: ComboboxOption[] = (institutions.data?.data ?? []).map((institution) => ({
    id: institution.id,
    label: institution.name,
  }))
  const facultyOptions: ComboboxOption[] = (faculties.data ?? []).map((faculty) => ({
    id: faculty.id,
    label: faculty.name,
  }))
  // Un trabajo institucional no puede ser extrainstitucional: solo quedan las demás modalidades (pregrado, posgrado).
  const isExtrainstitucional = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '').includes('extrainstitucional')
  const availableModalities = (modalities.data?.data ?? []).filter(
    (modality) => !esInstitucional || !isExtrainstitucional(modality.name),
  )
  const modalityOptions: ComboboxOption[] = availableModalities.map((modality) => ({
    id: modality.id,
    label: `${modality.name} · S/ ${modality.fee.toFixed(2)}`,
  }))

  // Si ya había elegido una modalidad extrainstitucional y el trabajo pasa a ser institucional, se vuelve a elegir.
  const selectedModality = modalities.data?.data.find((modality) => modality.id === modalidadId)
  useEffect(() => {
    if (esInstitucional && selectedModality && isExtrainstitucional(selectedModality.name)) {
      setValue('modalidadId', '', { shouldValidate: true })
    }
  }, [esInstitucional, selectedModality, setValue])

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">Institución, facultad y modalidad de revisión del protocolo.</p>

      <div className={cn('grid gap-5', facultadEnabled && 'sm:grid-cols-2')}>
        <FormField label="Institución" htmlFor="institucionId">
          <Controller
            name="institucionId"
            control={control}
            render={({ field }) => (
              <Combobox
                options={institutionOptions}
                value={field.value}
                onChange={(id) => {
                  field.onChange(id)
                  // La facultad elegida pertenecía a otra universidad (o a ninguna): se vuelve a elegir.
                  setValue('facultadId', '', { shouldValidate: true })
                }}
                loading={institutions.isPending}
                placeholder="Selecciona la institución (opcional)"
                label="institución"
              />
            )}
          />
          {selectedInstitution && !facultadEnabled && (
            <p className="mt-1.5 text-xs text-text-muted">
              Solo las universidades tienen facultades, así que no aplica seleccionar una.
            </p>
          )}
        </FormField>

        {facultadEnabled && (
          <FormField label="Facultad" htmlFor="facultadId">
            <Controller
              name="facultadId"
              control={control}
              render={({ field }) => (
                <Combobox
                  options={facultyOptions}
                  value={field.value}
                  onChange={field.onChange}
                  loading={faculties.isPending}
                  placeholder={
                    facultyOptions.length === 0 && !faculties.isPending
                      ? 'Esta universidad aún no tiene facultades'
                      : 'Selecciona la facultad (opcional)'
                  }
                  label="facultad"
                />
              )}
            />
          </FormField>
        )}
      </div>

      <FormField label="Modalidad" htmlFor="modalidadId" error={errors.modalidadId?.message} required>
        <Controller
          name="modalidadId"
          control={control}
          render={({ field }) => (
            <Combobox
              options={modalityOptions}
              value={field.value}
              onChange={field.onChange}
              loading={modalities.isPending}
              error={errors.modalidadId?.message}
              placeholder="Selecciona la modalidad"
              label="modalidad"
            />
          )}
        />
      </FormField>
    </div>
  )
}
