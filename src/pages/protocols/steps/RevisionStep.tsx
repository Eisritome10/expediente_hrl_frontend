import { useFormContext } from 'react-hook-form'
import { FormField, Input, Select, Textarea } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

export function RevisionStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const esEnmienda = watch('esEnmienda')
  const esConvenio = watch('esConvenio')
  const requiresPaymentDetails = !esEnmienda && !esConvenio

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">Propósito de la revisión y condiciones de pago.</p>

      <FormField label="Propósito de la revisión" htmlFor="propositoRevision" error={errors.propositoRevision?.message} required>
        <Textarea
          id="propositoRevision"
          placeholder="Revisión inicial"
          error={errors.propositoRevision?.message}
          {...register('propositoRevision')}
        />
      </FormField>

      <FormField label="Fecha de revisión" htmlFor="fechaRevision" error={errors.fechaRevision?.message}>
        <Input id="fechaRevision" type="date" error={errors.fechaRevision?.message} {...register('fechaRevision')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <Switch
          checked={esEnmienda}
          onChange={(checked) => setValue('esEnmienda', checked, { shouldValidate: true })}
          label="Es enmienda"
          description="El pago de revisión no aplica en enmiendas."
        />
        <Switch
          checked={esConvenio}
          onChange={(checked) => setValue('esConvenio', checked, { shouldValidate: true })}
          label="Es convenio"
          description="El pago de revisión no aplica en convenios."
        />
      </div>

      {esConvenio && (
        <FormField label="Nombre de la institución del convenio" htmlFor="nombreConvenio" error={errors.nombreConvenio?.message} required>
          <Input
            id="nombreConvenio"
            placeholder="Nombre del convenio"
            error={errors.nombreConvenio?.message}
            {...register('nombreConvenio')}
          />
        </FormField>
      )}

      {requiresPaymentDetails && (
        <div className="grid gap-5 rounded-lg border border-border bg-surface-muted/60 p-4 sm:grid-cols-3">
          <FormField label="Pago de revisión (S/)" htmlFor="pagoRevision" error={errors.pagoRevision?.message}>
            <Input
              id="pagoRevision"
              type="number"
              step="0.01"
              min="0"
              error={errors.pagoRevision?.message}
              {...register('pagoRevision', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Tipo de comprobante" htmlFor="tipoComprobante" error={errors.tipoComprobante?.message}>
            <Select id="tipoComprobante" error={errors.tipoComprobante?.message} {...register('tipoComprobante')}>
              <option value="">Selecciona...</option>
              <option value="BOLETA">Boleta</option>
              <option value="FACTURA">Factura</option>
            </Select>
          </FormField>

          <FormField label="N° de comprobante" htmlFor="comprobanteRevision" error={errors.comprobanteRevision?.message}>
            <Input
              id="comprobanteRevision"
              placeholder="B001-000123"
              error={errors.comprobanteRevision?.message}
              {...register('comprobanteRevision')}
            />
          </FormField>
        </div>
      )}
    </div>
  )
}
