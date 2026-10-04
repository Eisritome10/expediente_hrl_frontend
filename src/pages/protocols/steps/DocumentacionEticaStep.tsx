import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField, Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import type { ProtocolFormValues } from '@/schemas/protocol.schema'

export function DocumentacionEticaStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProtocolFormValues>()

  const tieneConstanciaEtica = watch('tieneConstanciaEtica')
  const consentimientoInformado = watch('consentimientoInformado')
  const requiereRevisionHc = watch('requiereRevisionHc')
  const certificadoBuenasPracticas = watch('certificadoBuenasPracticas')

  // El certificado de buenas prácticas solo aplica si el protocolo requiere revisión de historia clínica.
  useEffect(() => {
    if (!requiereRevisionHc) setValue('certificadoBuenasPracticas', false)
  }, [requiereRevisionHc, setValue])

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-muted">
        Documentación que el investigador entrega con el protocolo. El CIEI la evalúa y exige que esté registrada para
        finalizar.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Switch
          checked={tieneConstanciaEtica}
          onChange={(checked) => setValue('tieneConstanciaEtica', checked, { shouldValidate: true })}
          label="Cuenta con constancia ética"
          description="Emitida por un comité de ética."
        />
        <Switch
          checked={consentimientoInformado}
          onChange={(checked) => setValue('consentimientoInformado', checked, { shouldValidate: true })}
          label="Cuenta con consentimiento informado"
        />
      </div>

      {tieneConstanciaEtica && (
        <div className="grid gap-5 rounded-lg border border-border bg-surface-muted/60 p-4 sm:grid-cols-2">
          <FormField label="N° o código de la constancia" htmlFor="idConstanciaEtica" error={errors.idConstanciaEtica?.message} required>
            <Input
              id="idConstanciaEtica"
              placeholder="CE-2026-045"
              error={errors.idConstanciaEtica?.message}
              {...register('idConstanciaEtica')}
            />
          </FormField>

          <FormField label="Fecha de la constancia" htmlFor="fechaConstancia" error={errors.fechaConstancia?.message} required>
            <Input id="fechaConstancia" type="date" error={errors.fechaConstancia?.message} {...register('fechaConstancia')} />
          </FormField>
        </div>
      )}

      <FormField
        label="Departamento dirigido"
        htmlFor="departamentoDirigidoPermiso"
        hint="Opcional. Departamento al que se dirige el permiso."
        error={errors.departamentoDirigidoPermiso?.message}
      >
        <Input
          id="departamentoDirigidoPermiso"
          placeholder="Dpto. de Gineco-Obstetricia"
          error={errors.departamentoDirigidoPermiso?.message}
          {...register('departamentoDirigidoPermiso')}
        />
      </FormField>

      {requiereRevisionHc && (
        <Switch
          checked={certificadoBuenasPracticas}
          onChange={(checked) => setValue('certificadoBuenasPracticas', checked, { shouldValidate: true })}
          label="Cuenta con certificado de buenas prácticas"
          description="Se pide porque el protocolo requiere revisión de historia clínica."
        />
      )}
    </div>
  )
}
