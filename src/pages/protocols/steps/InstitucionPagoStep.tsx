import { InstitucionStep } from '@/pages/protocols/steps/InstitucionStep'
import { PagoStep } from '@/pages/protocols/steps/PagoStep'

/** Institución, modalidad y pago van juntos: la modalidad elegida arriba fija el monto del pago de abajo. */
export function InstitucionPagoStep() {
  return (
    <div className="flex flex-col gap-8">
      <InstitucionStep />

      <section aria-labelledby="pago-revision-title" className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 id="pago-revision-title" className="text-base font-semibold text-text">
          Pago de revisión
        </h2>
        <PagoStep />
      </section>
    </div>
  )
}
