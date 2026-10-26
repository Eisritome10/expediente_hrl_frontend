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

  const usaHistoriaClinica = watch('usaHistoriaClinica')
  const requiereRevisionHc = watch('requiereRevisionHc')
  const certificadoBuenasPracticas = watch('certificadoBuenasPracticas')

  // El flujo es condicional en cascada: sin uso de HC no hay revisión ni certificado; con revisión, el monto es fijo.
  useEffect(() => {
    if (!usaHistoriaClinica) {
      setValue('requiereRevisionHc', false)
      setValue('tipoComprobanteHc', '')
      setValue('nroComprobanteHc', '')
      setValue('certificadoBuenasPracticas', false)
    } else if (requiereRevisionHc) {
      setValue('montoHc', HC_REVIEW_FEE)
    } else {
      setValue('tipoComprobanteHc', '')
      setValue('nroComprobanteHc', '')
    }
  }, [usaHistoriaClinica, requiereRevisionHc, setValue])

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">Uso y revisión de historias clínicas del protocolo.</p>

      <Switch
        checked={usaHistoriaClinica}
        onChange={(checked) => setValue('usaHistoriaClinica', checked, { shouldValidate: true })}
        label="¿Hace uso de historias clínicas?"
        description="Indica si el protocolo de investigación utiliza historias clínicas."
      />

      {usaHistoriaClinica && (
        <Switch
          checked={requiereRevisionHc}
          onChange={(checked) => setValue('requiereRevisionHc', checked, { shouldValidate: true })}
          label="¿Requiere revisión de HC de estadística?"
          description="Indica si requiere la revisión de historias clínicas por el área de Estadística."
        />
      )}

      {usaHistoriaClinica && requiereRevisionHc && (
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
      )}

      {usaHistoriaClinica && (
        <Switch
          checked={certificadoBuenasPracticas}
          onChange={(checked) => setValue('certificadoBuenasPracticas', checked, { shouldValidate: true })}
          label="Cuenta con certificado de buenas prácticas"
          description="Se solicita porque el protocolo hace uso de historias clínicas."
        />
      )}

    </div>
  )
}
