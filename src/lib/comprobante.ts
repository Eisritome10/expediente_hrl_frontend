// Comprobantes de pago electrónicos de SUNAT: la serie tiene 4 caracteres (B = boleta, F = factura, seguidos de
// 3 alfanuméricos, p. ej. B001, F001, BA01) y el correlativo hasta 8 dígitos, separados por guion.
// Debe coincidir con `comprobante.util.ts` del backend.
const COMPROBANTE_PATTERNS: Record<string, RegExp> = {
  BOLETA: /^B[A-Z0-9]{3}-\d{1,8}$/,
  FACTURA: /^F[A-Z0-9]{3}-\d{1,8}$/,
}

/** Devuelve el mensaje de error del comprobante o `null` si el tipo y el número son válidos. */
export function comprobanteError(tipo: string, numero: string): string | null {
  const pattern = COMPROBANTE_PATTERNS[tipo.trim().toUpperCase()]
  if (!pattern) return null
  if (pattern.test(numero.trim().toUpperCase())) return null
  return tipo.trim().toUpperCase() === 'BOLETA'
    ? 'La boleta debe tener serie y correlativo, p. ej. B001-00001234.'
    : 'La factura debe tener serie y correlativo, p. ej. F001-00001234.'
}

/** Formato del número de expediente que envía el cliente: de 1 a 5 dígitos. El backend arma "<numero>/<año>". */
export const NUMERO_EXPEDIENTE_PATTERN = /^\d{1,5}$/
