import { describe, it, expect } from 'vitest'
import proj4 from 'proj4'

import { epsgTo4326 } from '../src/modules/epsgTo4326.ts'
import { epsgFrom4326 } from '../src/modules/epsgFrom4326.ts'

// Swiss LV95 / EPSG:2056 — its defining point (2600000, 1200000)
// corresponds to roughly (7.43958 E, 46.95241 N)
const EPSG_2056 =
  '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'

describe('epsgTo4326', () => {
  // Characterization: the module reverses to [lat, lng] — Leaflet's
  // map.setView([x, y]) consumes exactly that order.
  it('returns [lat, lng] when the project CRS is 4326', () => {
    expect(
      epsgTo4326({ x: 8.2, y: 46.8, projectMapPresentationCrs: 'EPSG:4326' }),
    ).toEqual([46.8, 8.2])
  })

  it('returns [lat, lng] when no project CRS is set', () => {
    expect(epsgTo4326({ x: 8.2, y: 46.8, projectMapPresentationCrs: undefined })).toEqual(
      [46.8, 8.2],
    )
  })

  it('projects LV95 coordinates to [lat, lng]', () => {
    proj4.defs('EPSG:2056', EPSG_2056)
    const [lat, lng] = epsgTo4326({
      x: 2600000,
      y: 1200000,
      projectMapPresentationCrs: 'EPSG:2056',
    })
    // tolerance covers the towgs84 datum shift (~150 m)
    expect(Math.abs(lat - 46.9524)).toBeLessThan(0.002)
    expect(Math.abs(lng - 7.4396)).toBeLessThan(0.002)
  })

  it('coerces string input to numbers before projecting', () => {
    proj4.defs('EPSG:2056', EPSG_2056)
    const [lat, lng] = epsgTo4326({
      x: '2600000',
      y: '1200000',
      projectMapPresentationCrs: 'EPSG:2056',
    })
    expect(Math.abs(lat - 46.9524)).toBeLessThan(0.002)
    expect(Math.abs(lng - 7.4396)).toBeLessThan(0.002)
  })
})

describe('epsgFrom4326', () => {
  // Characterization: no reversal here — result is [x, y] in map-CRS order.
  it('passes [lng, lat] through unchanged for EPSG:4326', () => {
    expect(
      epsgFrom4326({
        x: 7.43958,
        y: 46.95241,
        projectMapPresentationCrs: 'EPSG:4326',
      }),
    ).toEqual([7.43958, 46.95241])
  })

  it('passes values through when no project CRS is set', () => {
    expect(
      epsgFrom4326({ x: 7.4, y: 46.9, projectMapPresentationCrs: undefined }),
    ).toEqual([7.4, 46.9])
  })

  it('passes non-finite values through unchanged (no projection attempted)', () => {
    expect(
      epsgFrom4326({
        x: Number.NaN,
        y: 46.9,
        projectMapPresentationCrs: 'EPSG:2056',
      }),
    ).toEqual([Number.NaN, 46.9])
  })

  it('passes through when the crs record has no proj4 definition', () => {
    expect(
      epsgFrom4326({
        x: 7.4,
        y: 46.9,
        projectMapPresentationCrs: 'EPSG:2056',
        crs: { code: 'EPSG:2056' },
      }),
    ).toEqual([7.4, 46.9])
  })

  it('projects [lng, lat] to LV95 [x, y] using the crs definition', () => {
    const [x, y] = epsgFrom4326({
      x: 7.43958,
      y: 46.95241,
      projectMapPresentationCrs: 'EPSG:2056',
      crs: { code: 'EPSG:2056', proj4: EPSG_2056 },
    })
    // tolerance covers the towgs84 datum shift (~150 m)
    expect(Math.abs(x - 2600000)).toBeLessThan(200)
    expect(Math.abs(y - 1200000)).toBeLessThan(200)
  })
})
