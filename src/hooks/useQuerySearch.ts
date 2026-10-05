import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Texto de búsqueda de un listado. Arranca con el valor de `?q=` (así la búsqueda global puede dejar
 * el listado ya filtrado) y se actualiza si llega otro `?q=` estando en la misma pantalla.
 */
export function useQuerySearch() {
  const [params] = useSearchParams()
  const fromUrl = params.get('q') ?? ''
  const [value, setValue] = useState(fromUrl)
  const [seenFromUrl, setSeenFromUrl] = useState(fromUrl)

  // Si llega otro `?q=` se ajusta durante el render (sin efecto): no hay un render intermedio con el texto viejo.
  if (seenFromUrl !== fromUrl) {
    setSeenFromUrl(fromUrl)
    setValue(fromUrl)
  }

  return [value, setValue] as const
}
