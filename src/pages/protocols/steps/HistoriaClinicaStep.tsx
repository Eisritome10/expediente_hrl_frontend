import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField, Input, Select } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { HC_REVIEW_FEE, type ProtocolFormValues } from '@/schemas/protocol.schema'

export function HistoriaClinicaStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const requiereRevisionHc = watch('requiereRevisionHc')
  const certificadoBuenasPracticas = watch('certificadoBuenasPracticas')

  // La revisión de historia clínica tiene un monto fijo; y el certificado solo aplica cuando hay revisión de HC.
  useEffect(() => {
    if (requiereRevisionHc) {
      setValue('montoHc', HC_REVIEW_FEE)
    } else {
      setValue('certificadoBuenasPracticas', false)
    }
  }, [requiereRevisionHc, setValue])

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">Revisión de historia clínica, si el protocolo la requiere.</p>

      <Switch
        checked={requiereRevisionHc}
        onChange={(checked) => setValue('requiereRevisionHc', checked, { shouldValidate: true })}
        label="Requiere revisión de historia clínica"
      />

      {requiereRevisionHc && (
        <>
          <div className="grid gap-5 rounded-lg border border-border bg-surface-muted/60 p-4 sm:grid-cols-3">
            <FormField label="Monto (S/)" htmlFor="montoHc" hint="Monto fijo de la revisión; no se edita." error={errors.montoHc?.message}>
              <Input
                id="montoHc"
                type="number"
                readOnly
                tabIndex={-1}
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
                placeholder="B001-00001234"
                className="uppercase"
                error={errors.nroComprobanteHc?.message}
                {...register('nroComprobanteHc')}
              />
            </FormField>
          </div>

          <Switch
            checked={certificadoBuenasPracticas}
            onChange={(checked) => setValue('certificadoBuenasPracticas', checked, { shouldValidate: true })}
            label="Cuenta con certificado de buenas prácticas"
            description="Se pide porque el protocolo requiere revisión de historia clínica."
          />
        </>
      )}
    </div>
  )
}
