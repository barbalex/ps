// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'

import { onTileError } from '../src/components/Map/layers/WmsLayer/onTileError.ts'
import { notificationsAtom, store } from '../src/store.ts'

const url =
  'https://example.test/wms?request=GetMap&crs=EPSG%3A3857&bbox=1,2,3,4'

afterEach(() => {
  vi.unstubAllGlobals()
  store.set(notificationsAtom, [])
})

it('checks the failed tile URL and reports a WMS exception even on HTTP 200', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(
      new Response(
        '<ServiceExceptionReport><ServiceException code="LayerNotDefined">Unknown layer</ServiceException></ServiceExceptionReport>',
      ),
    )
  vi.stubGlobal('fetch', fetch)
  await onTileError(url, 'Übersichtsplan')
  expect(fetch).toHaveBeenCalledWith(url)
  expect(store.get(notificationsAtom)[0]?.body).toBe(
    'LayerNotDefined: Unknown layer',
  )
})

it('reports a failed network probe without rejecting the tile event', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
  )
  await onTileError(url, 'Übersichtsplan')
  expect(store.get(notificationsAtom)[0]?.body).toBe('Failed to fetch')
})

it('does not notify when the service returns an image on the probe', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(null, {
        headers: { 'Content-Type': 'image/png' },
      }),
    ),
  )
  await onTileError(url, 'Übersichtsplan')
  expect(store.get(notificationsAtom)).toHaveLength(0)
})
