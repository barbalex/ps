import { toPng } from 'html-to-image'
import type { Map as LeafletMap } from 'leaflet'

// Ported from apf2, where it replaced the unmaintained leaflet-easyprint
// (Leaflet-1-only): easyprint internally captured the map's DOM with
// dom-to-image and, for printing, opened a popup with the image and @page
// CSS. This does the same with the maintained html-to-image.

// thrown when the browser blocks the print popup — the caller turns it
// into a translated notification
export class PrintPopupBlockedError extends Error {
  constructor() {
    super('The print popup was blocked by the browser')
    this.name = 'PrintPopupBlockedError'
  }
}

// wait until all visible tiles have loaded (or errored) so the capture
// doesn't show grey placeholders — replaces easyprint's tileWait: 2000
const waitForTiles = async (container: HTMLElement, timeoutMs = 4000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const pending = container.querySelectorAll(
      'img.leaflet-tile:not(.leaflet-tile-loaded)',
    ).length
    if (!pending) return
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

/**
 * Captures the map as a PNG data URL, with the controls hidden: leaflet's
 * own plus the self-built ones (global class map-own-controls, set on the
 * BottomRightControl container). Tiles must be CORS-enabled (all tile
 * servers this app uses are).
 */
export const captureMap = async (map: LeafletMap): Promise<string> => {
  const container = map.getContainer()
  await waitForTiles(container)

  const controlContainers = [
    ...container.querySelectorAll<HTMLElement>(
      '.leaflet-control-container, .map-own-controls',
    ),
  ]
  const previousDisplays = controlContainers.map((c) => c.style.display)
  controlContainers.forEach((c) => (c.style.display = 'none'))

  try {
    return await toPng(container, { cacheBust: true })
  } finally {
    controlContainers.forEach(
      (c, i) => (c.style.display = previousDisplays[i] ?? ''),
    )
  }
}

/**
 * Prints the captured map in a popup window, sized for the given @page
 * size ('' = current size) — easyprint's print flow.
 *
 * The image is constrained to one page: percentage max-heights only work
 * against a definite height, so html/body get height 100% (a map taller
 * than the page would otherwise be sliced across pages, preceded by an
 * empty page).
 */
export const printMap = async (map: LeafletMap, pageSize: string) => {
  // open the window before the asynchronous capture: afterwards the
  // browser no longer counts this as a user gesture and blocks the popup
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    throw new PrintPopupBlockedError()
  }
  let dataUrl: string
  try {
    dataUrl = await captureMap(map)
  } catch (error) {
    printWindow.close()
    throw error
  }

  const pageRule = pageSize ? `size: ${pageSize}; margin: 0;` : 'margin: 0;'
  printWindow.document.write(`<!DOCTYPE html><html><head>
    <title>Arten fördern</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      img {
        max-width: 100%;
        max-height: 100%;
      }
      @media print {
        @page { ${pageRule} }
      }
    </style>
  </head><body>
    <img src="${dataUrl}"
      onload="setTimeout(() => { window.print(); window.close() }, 100)">
  </body></html>`)
  printWindow.document.close()
}
