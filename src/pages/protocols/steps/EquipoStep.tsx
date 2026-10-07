import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { MultiCombobox } from '@/components/ui/MultiCombobox'
import { FormField } from '@/components/ui/Input'
import { useResearchersList } from '@/hooks/useResearchers'
import { useResearchLinesByType } from '@/hooks/useResearchLines'
import { ResearcherFormDialog } from '@/pages/researchers/ResearcherFormDialog'
import { ResearchLineFormDialog } from '@/pages/research-lines/ResearchLineFormDialog'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

const CATALOG_LIMIT = 100

export function EquipoStep() {
  const [openResearcherDialog, setOpenResearcherDialog] = useState(false)
  const [openResearchLineDialog, setOpenResearchLineDialog] = useState<'HRL' | 'META_2030' | null>(null)

  const {
    control,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const investigadorPrincipalId = useWatch<ProtocolFormValues, 'investigadorPrincipalId'>({
    control,
    name: 'investigadorPrincipalId',
  })

  const coinvestigadorIds = useWatch<ProtocolFormValues, 'coinvestigadorIds'>({
    control,
    name: 'coinvestigadorIds',
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

  // Asesores no pueden ser coinvestigadores
  const asesorOptions = useMemo(
    () => teamOptions.filter((option) => !coinvestigadorIds.includes(option.id)),
    [teamOptions, coinvestigadorIds],
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
              onCreateNew={() => setOpenResearcherDialog(true)}
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
              onCreateNew={() => setOpenResearcherDialog(true)}
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
              options={asesorOptions}
              value={field.value}
              onChange={field.onChange}
              loading={researchers.isPending}
              placeholder="Agregar asesor (opcional)"
              label="asesores"
              onCreateNew={() => setOpenResearcherDialog(true)}
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
                onCreateNew={() => setOpenResearchLineDialog('HRL')}
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
                onCreateNew={() => setOpenResearchLineDialog('META_2030')}
              />
            )}
          />
        </FormField>
      </div>

      {createPortal(
        <>
          <ResearcherFormDialog open={openResearcherDialog} onClose={() => setOpenResearcherDialog(false)} researcher={null} />
          <ResearchLineFormDialog
            open={openResearchLineDialog === 'HRL'}
            onClose={() => setOpenResearchLineDialog(null)}
            researchLine={null}
            type="HRL"
          />
          <ResearchLineFormDialog
            open={openResearchLineDialog === 'META_2030'}
            onClose={() => setOpenResearchLineDialog(null)}
            researchLine={null}
            type="META_2030"
          />
        </>,
        document.body,
      )}
    </div>
  )
}
