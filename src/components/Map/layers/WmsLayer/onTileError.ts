import { ogcException } from '../../../../modules/ogcException.ts'
import { store, addNotificationAtom } from '../../../../store.ts'

export const onTileError = async (url: string, label: string) => {
  let body: string
  try {
    // An image element doesn't expose the WMS exception body. Probe the
    // same tile, preserving its CRS, bounding box and service parameters.
    const response = await fetch(url)
    if (
      response.ok &&
      response.headers.get('content-type')?.startsWith('image/')
    )
      return

    const text = await response.text()
    const exception =
      text.trimStart().startsWith('<') ?
        ogcException(new DOMParser().parseFromString(text, 'text/xml'))
      : undefined
    body =
      exception?.message ??
      `HTTP ${response.status} ${response.statusText}: Keine Kartenkachel erhalten.`
  } catch (error) {
    body = error instanceof Error ? error.message : String(error)
  }
  store.set(addNotificationAtom, {
    title: `Fehler beim Laden der Bild-Karte '${label}'`,
    body,
    intent: 'error',
  })
}
