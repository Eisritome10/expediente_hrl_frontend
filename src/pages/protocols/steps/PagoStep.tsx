import { useEffect, useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { FormField, Input, Select } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useAgreementsList } from '@/hooks/useAgreements'
import { useModalitiesList } from '@/hooks/useModalities'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

/** Sección de pago dentro del paso "Institución y pago": el monto lo fija la modalidad elegida arriba. */
export function PagoStep() {
  const {
    register,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const esEnmienda = watch('esEnmienda')
  const esConvenio = watch('esConvenio')
  const modalidadId = watch('modalidadId')
  const exonerado = esEnmienda || esConvenio

  const { data: modalitiesData } = useModalitiesList({ page: 1, limit: 100 })
  const modalityFee = modalitiesData?.data.find((modality) => modality.id === modalidadId)?.fee

  // El monto no se edita: es la tarifa de la modalidad. Enmienda y convenio no pagan revisión (0, sin comprobante).
  useEffect(() => {
    if (exonerado) {
      setValue('pagoRevision', 0)
      setValue('tipoComprobante', '')
      setValue('comprobanteRevision', '')
    } else {
      setValue('pagoRevision', modalityFee)
    }
  }, [exonerado, modalityFee, setValue])

  const { data: agreementsData, isPending: loadingAgreements } = useAgreementsList({ limit: 100 })
  const agreementOptions: ComboboxOption[] = useMemo(
    () => (agreementsData?.data ?? []).map((a) => ({ id: a.id, label: a.name })),
    [agreementsData],
  )

  const handleConvenioChange = (checked: boolean) => {
    setValue('esConvenio', checked, { shouldValidate: true })
    // Sin convenio no se arrastra un convenio elegido antes.
    if (!checked) setValue('convenioId', '', { shouldValidate: true })
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">
        Indica si el protocolo es de convenio. Si lo es, eliges el convenio; si no, registras el comprobante del pago de
        revisión, cuyo monto establece la modalidad.
      </p>

      <Switch
        checked={esConvenio}
        onChange={handleConvenioChange}
        label="Es convenio"
        description="Los protocolos de convenio no pagan revisión."
      />

      {esConvenio && (
        <Controller
          name="convenioId"
          control={control}
          render={({ field }) => (
            <FormField label="Convenio" htmlFor="convenioId" error={errors.convenioId?.message} required>
              <Combobox
                options={agreementOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecciona el convenio"
                loading={loadingAgreements}
                error={errors.convenioId?.message}
                label="convenio"
              />
            </FormField>
          )}
        />
      )}

      {exonerado ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-emerald-800">
          Exonerado del pago de revisión (S/ 0.00)
          {esEnmienda ? ': las enmiendas no pagan revisión.' : ': los protocolos de convenio no pagan revisión.'}
        </div>
      ) : (
        <div className="grid gap-5 rounded-lg border border-border bg-surface-muted/60 p-4 sm:grid-cols-3">
          <FormField
            label="Pago de revisión (S/)"
            htmlFor="pagoRevision"
            hint={modalityFee === undefined ? 'Selecciona la modalidad para establecer el monto.' : 'Lo establece la modalidad; no se edita.'}
            error={errors.pagoRevision?.message}
          >
            <Input
              id="pagoRevision"
              type="number"
              readOnly
              tabIndex={-1}
              placeholder="Según la modalidad"
              error={errors.pagoRevision?.message}
              {...register('pagoRevision', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Tipo de comprobante" htmlFor="tipoComprobante" error={errors.tipoComprobante?.message} required>
            <Select id="tipoComprobante" error={errors.tipoComprobante?.message} {...register('tipoComprobante')}>
              <option value="">Selecciona...</option>
              <option value="BOLETA">Boleta</option>
              <option value="FACTURA">Factura</option>
            </Select>
          </FormField>

          <FormField
            label="N° de comprobante"
            htmlFor="comprobanteRevision"
            hint="Serie y correlativo, p. ej. B001-00001234 o F001-00001234."
            error={errors.comprobanteRevision?.message}
            required
          >
            <Input
              id="comprobanteRevision"
              placeholder="B001-00001234"
              className="uppercase"
              error={errors.comprobanteRevision?.message}
              {...register('comprobanteRevision')}
            />
          </FormField>
        </div>
      )}
    </div>
  )
}
