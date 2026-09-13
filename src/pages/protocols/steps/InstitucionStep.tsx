import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { FormField } from '@/components/ui/Input'
import { useFacultiesList } from '@/hooks/useFaculties'
import { useInstitutionsList } from '@/hooks/useInstitutions'
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

  const institutions = useInstitutionsList({ page: 1, limit: CATALOG_LIMIT })
  const faculties = useFacultiesList({ page: 1, limit: CATALOG_LIMIT })
  const modalities = useModalitiesList({ page: 1, limit: CATALOG_LIMIT })

  const selectedInstitution = institutions.data?.data.find((institution) => institution.id === institucionId)
  const facultadEnabled = Boolean(selectedInstitution?.esUniversidad)

  const institutionOptions: ComboboxOption[] = (institutions.data?.data ?? []).map((institution) => ({
    id: institution.id,
    label: institution.name,
  }))
  const facultyOptions: ComboboxOption[] = (faculties.data?.data ?? []).map((faculty) => ({
    id: faculty.id,
    label: faculty.name,
  }))
  const modalityOptions: ComboboxOption[] = (modalities.data?.data ?? []).map((modality) => ({
    id: modality.id,
    label: `${modality.name} · S/ ${modality.fee.toFixed(2)}`,
  }))

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
                  const institution = institutions.data?.data.find((item) => item.id === id)
                  if (!institution?.esUniversidad) setValue('facultadId', '', { shouldValidate: true })
                }}
                loading={institutions.isPending}
                placeholder="Selecciona la institución (opcional)"
                label="institución"
              />
            )}
          />
          {selectedInstitution && !facultadEnabled && (
            <p className="mt-1.5 text-xs text-text-muted">
              Esta institución no es universidad, así que no aplica seleccionar facultad.
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
                  placeholder="Selecciona la facultad (opcional)"
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
              onChange={(id) => {
                field.onChange(id)
                const modality = modalities.data?.data.find((item) => item.id === id)
                if (modality) setValue('pagoRevision', modality.fee, { shouldValidate: true })
              }}
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
