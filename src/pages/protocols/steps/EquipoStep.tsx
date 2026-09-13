import { useMemo } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { MultiCombobox } from '@/components/ui/MultiCombobox'
import { FormField } from '@/components/ui/Input'
import { useResearchersList } from '@/hooks/useResearchers'
import { useResearchLinesByType } from '@/hooks/useResearchLines'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

const CATALOG_LIMIT = 100

export function EquipoStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const investigadorPrincipalId = useWatch<ProtocolFormValues, 'investigadorPrincipalId'>({
    control,
    name: 'investigadorPrincipalId',
  })

  const researchers = useResearchersList({ page: 1, limit: CATALOG_LIMIT })
  const lineasHrl = useResearchLinesByType('HRL')
  const lineasMeta2030 = useResearchLinesByType('META_2030')

  const researcherOptions: ComboboxOption[] = (researchers.data?.data ?? []).map((researcher) => ({
    id: researcher.id,
    label: `${researcher.firstName} ${researcher.lastName}`,
    meta: researcher.dni,
  }))

  const teamOptions = useMemo(
    () => researcherOptions.filter((option) => option.id !== investigadorPrincipalId),
    [researcherOptions, investigadorPrincipalId],
  )

  const hrlOptions: ComboboxOption[] = (lineasHrl.data?.data ?? []).map((line) => ({ id: line.id, label: line.name }))
  const meta2030Options: ComboboxOption[] = (lineasMeta2030.data?.data ?? []).map((line) => ({
    id: line.id,
    label: line.name,
  }))

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">Equipo de trabajo responsable y líneas de investigación asociadas.</p>

      <FormField label="Investigador principal" htmlFor="investigadorPrincipalId" error={errors.investigadorPrincipalId?.message} required>
        <Controller
          name="investigadorPrincipalId"
          control={control}
          render={({ field }) => (
            <Combobox
              options={researcherOptions}
              value={field.value}
              onChange={field.onChange}
              loading={researchers.isPending}
              error={errors.investigadorPrincipalId?.message}
              placeholder="Busca al investigador principal"
              label="investigador principal"
            />
          )}
        />
      </FormField>

      <FormField label="Coinvestigadores" htmlFor="coinvestigadorIds" error={errors.coinvestigadorIds?.message}>
        <Controller
          name="coinvestigadorIds"
          control={control}
          render={({ field }) => (
            <MultiCombobox
              options={teamOptions}
              value={field.value}
              onChange={field.onChange}
              loading={researchers.isPending}
              placeholder="Agregar coinvestigador (opcional)"
              label="coinvestigadores"
            />
          )}
        />
      </FormField>

      <FormField label="Asesores" htmlFor="asesorIds" error={errors.asesorIds?.message}>
        <Controller
          name="asesorIds"
          control={control}
          render={({ field }) => (
            <MultiCombobox
              options={teamOptions}
              value={field.value}
              onChange={field.onChange}
              loading={researchers.isPending}
              placeholder="Agregar asesor (opcional)"
              label="asesores"
            />
          )}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Línea de investigación HRL" htmlFor="lineaHrlId" error={errors.lineaHrlId?.message} required>
          <Controller
            name="lineaHrlId"
            control={control}
            render={({ field }) => (
              <Combobox
                options={hrlOptions}
                value={field.value}
                onChange={field.onChange}
                loading={lineasHrl.isPending}
                error={errors.lineaHrlId?.message}
                placeholder="Selecciona la línea HRL"
                label="línea de investigación HRL"
              />
            )}
          />
        </FormField>

        <FormField label="Línea de investigación Meta 2030" htmlFor="lineaMeta2030Id" error={errors.lineaMeta2030Id?.message} required>
          <Controller
            name="lineaMeta2030Id"
            control={control}
            render={({ field }) => (
              <Combobox
                options={meta2030Options}
                value={field.value}
                onChange={field.onChange}
                loading={lineasMeta2030.isPending}
                error={errors.lineaMeta2030Id?.message}
                placeholder="Selecciona la línea Meta 2030"
                label="línea de investigación Meta 2030"
              />
            )}
          />
        </FormField>
      </div>
    </div>
  )
}
