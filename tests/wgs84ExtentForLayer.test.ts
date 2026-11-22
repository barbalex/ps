import { describe, expect, it } from 'vitest'

import { wgs84ExtentForLayer } from '../src/formsAndLists/wmsLayer/Form/CreateWmsService/getWmsCapabilitiesData.ts'

// from the crs table; geo.admin.ch advertises only EPSG:2056 bboxes
const PROJ4_2056 =
  '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'

const CRS_MAP = new Map([['EPSG:2056', PROJ4_2056]])

describe('wgs84ExtentForLayer', () => {
  it('passes an EPSG:4326 bounding box through unchanged', () => {
    const extent = wgs84ExtentForLayer(
      {
        BoundingBox: [{ crs: 'EPSG:4326', extent: [8.1, 47.1, 8.9, 47.6] }],
      },
      CRS_MAP,
    )
    expect(extent).toEqual({ xMin: 8.1, yMin: 47.1, xMax: 8.9, yMax: 47.6 })
  })

  it('reprojects an EPSG:2056 bounding box to WGS84, clamped to Switzerland', () => {
    // ch.bafu.bundesinventare-auen: over-wide box far outside LV95's domain —
    // oblique mercator extrapolates ~100km off there, so the crs area of use
    // bounds the result
    const extent = wgs84ExtentForLayer(
      {
        BoundingBox: [{ crs: 'EPSG:2056', extent: [2300000, 900000, 3100000, 1450000] }],
      },
      CRS_MAP,
    )
    expect(extent).toEqual({ xMin: 5.91, yMin: 45.82, xMax: 10.49, yMax: 47.81 })
  })

  it('reprojects an in-domain EPSG:2056 bounding box (Zürich ballpark)', () => {
    const extent = wgs84ExtentForLayer(
      {
        BoundingBox: [{ crs: 'EPSG:2056', extent: [2680000, 1244000, 2695000, 1258000] }],
      },
      CRS_MAP,
    )
    expect(extent).toBeDefined()
    expect(extent!.xMin).toBeGreaterThan(8.3)
    expect(extent!.xMin).toBeLessThan(8.7)
    expect(extent!.xMax).toBeGreaterThan(8.4)
    expect(extent!.xMax).toBeLessThan(8.9)
    expect(extent!.yMin).toBeGreaterThan(47.2)
    expect(extent!.yMin).toBeLessThan(47.5)
    expect(extent!.yMax).toBeGreaterThan(47.3)
    expect(extent!.yMax).toBeLessThan(47.6)
  })

  it('accepts a single BoundingBox object instead of an array', () => {
    const extent = wgs84ExtentForLayer(
      { BoundingBox: { crs: 'EPSG:4326', extent: [8, 47, 9, 48] } },
      CRS_MAP,
    )
    expect(extent).toEqual({ xMin: 8, yMin: 47, xMax: 9, yMax: 48 })
  })

  it('prefers EPSG:4326 over projectable boxes', () => {
    const extent = wgs84ExtentForLayer(
      {
        BoundingBox: [
          { crs: 'EPSG:2056', extent: [2600000, 1200000, 2610000, 1210000] },
          { crs: 'EPSG:4326', extent: [8, 47, 9, 48] },
        ],
      },
      CRS_MAP,
    )
    expect(extent).toEqual({ xMin: 8, yMin: 47, xMax: 9, yMax: 48 })
  })

  it('returns undefined for a crs without a proj4 definition', () => {
    const extent = wgs84ExtentForLayer(
      { BoundingBox: [{ crs: 'EPSG:31467', extent: [1, 2, 3, 4] }] },
      CRS_MAP,
    )
    expect(extent).toBeUndefined()
  })

  it('returns undefined without bounding boxes', () => {
    expect(wgs84ExtentForLayer({}, CRS_MAP)).toBeUndefined()
    expect(wgs84ExtentForLayer({ BoundingBox: [] }, CRS_MAP)).toBeUndefined()
  })
})
