import { useFormContext } from 'react-hook-form'
import { FormField, Input, Select } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

export function HistoriaClinicaStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const requiereRevisionHc = watch('requiereRevisionHc')

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">Revisión de historia clínica, si el protocolo la requiere.</p>

      <Switch
        checked={requiereRevisionHc}
        onChange={(checked) => setValue('requiereRevisionHc', checked, { shouldValidate: true })}
        label="Requiere revisión de historia clínica"
      />

      {requiereRevisionHc && (
        <div className="grid gap-5 rounded-lg border border-border bg-surface-muted/60 p-4 sm:grid-cols-3">
          <FormField label="Monto (S/)" htmlFor="montoHc" error={errors.montoHc?.message} required>
            <Input
              id="montoHc"
              type="number"
              step="0.01"
              min="0"
              error={errors.montoHc?.message}
              {...register('montoHc', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Tipo de comprobante" htmlFor="tipoComprobanteHc" error={errors.tipoComprobanteHc?.message} required>
            <Select id="tipoComprobanteHc" error={errors.tipoComprobanteHc?.message} {...register('tipoComprobanteHc')}>
              <option value="">Selecciona...</option>
              <option value="BOLETA">Boleta</option>
              <option value="FACTURA">Factura</option>
            </Select>
          </FormField>

          <FormField
            label="N° de comprobante"
            htmlFor="nroComprobanteHc"
            hint="Serie y correlativo, p. ej. B001-00001234 o F001-00001234."
            error={errors.nroComprobanteHc?.message}
            required
          >
            <Input
              id="nroComprobanteHc"
              placeholder="B001-000123"
              error={errors.nroComprobanteHc?.message}
              {...register('nroComprobanteHc')}
            />
          </FormField>
        </div>
      )}
    </div>
  )
}
