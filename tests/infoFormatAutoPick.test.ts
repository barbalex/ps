import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'

import { createTestDb } from './helpers/createTestDb.ts'

/**
 * When the capabilities of a service arrive, one of its formats is stored as the
 * one to ask for first — by the ranking the click listener then falls back through.
 */

vi.mock('../src/modules/getCapabilities.ts', () => ({
  getCapabilities: vi.fn(),
}))

import { getCapabilities } from '../src/modules/getCapabilities.ts'
import { getWmsCapabilitiesData } from '../src/formsAndLists/wmsLayer/Form/CreateWmsService/getWmsCapabilitiesData.ts'
import { getWfsCapabilitiesData } from '../src/formsAndLists/vectorLayer/Form/getWfsCapabilitiesData.ts'
import { operationsQueueAtom, pgliteDbAtom, store } from '../src/store.ts'
import type WmsServices from '../src/models/public/WmsServices.ts'
import type WfsServices from '../src/models/public/WfsServices.ts'
import type VectorLayers from '../src/models/public/VectorLayers.ts'

// what the services advertised on 2026-11-24
const AARGAU_GEOSERVER = [
  'application/json',
  'application/vnd.ogc.gml',
  'application/vnd.ogc.gml/3.1.1',
  'text/html',
  'text/plain',
  'text/xml',
  'text/xml; subtype=gml/3.1.1',
]
const BERN_ARCGIS = [
  'application/geo+json',
  'application/vnd.esri.wms_featureinfo_xml',
  'application/vnd.esri.wms_raw_xml',
  'application/vnd.ogc.wms_xml',
  'text/html',
  'text/plain',
  'text/xml',
]
const GLARUS_QGIS_WFS = [
  'text/xml; subtype=gml/2.1.2',
  'text/xml; subtype=gml/3.1.1',
  'application/vnd.geo+json',
]
const SCHWYZ_MAPSERVER_WFS = [
  'application/gml+xml; version=3.2',
  'text/xml; subtype=gml/3.2.1',
  'text/xml; subtype=gml/3.1.1',
]

// the shape WMSCapabilities().parse() returns (getCapabilities is mocked)
const wmsCapabilitiesWith = (infoFormats: string[]) => ({
  version: '1.3.0',
  Capability: {
    Request: {
      GetMap: { Format: ['image/png'] },
      GetFeatureInfo: { Format: infoFormats },
    },
    Layer: {
      Layer: [{ Name: 'test.wms.one', Title: 'One', CRS: ['EPSG:4326'] }],
    },
  },
})

// the shape xmlToJson(DOMParser…) returns for a wfs capabilities document
const wfsCapabilitiesWith = (outputFormats: string[]) => ({
  HTML: {
    BODY: {
      'WFS:WFS_CAPABILITIES': {
        '@attributes': { version: '2.0.0' },
        'OWS:OPERATIONSMETADATA': {
          'OWS:OPERATION': [
            {
              '@attributes': { name: 'GetFeature' },
              'OWS:PARAMETER': {
                'OWS:ALLOWEDVALUES': {
                  'OWS:VALUE': outputFormats.map((format) => ({
                    '#text': format,
                  })),
                },
              },
            },
          ],
        },
        FEATURETYPELIST: {
          FEATURETYPE: [
            {
              NAME: { '#text': 'test.wfs.one' },
              TITLE: { '#text': 'One' },
              DEFAULTCRS: { '#text': 'urn:ogc:def:crs:EPSG::4326' },
              OUTPUTFORMATS: {
                FORMAT: outputFormats.map((format) => ({ '#text': format })),
              },
            },
          ],
        },
      },
    },
  },
})

let db: PGlite
let projectId: string

beforeAll(async () => {
  const fixture = await createTestDb()
  db = fixture.db
  projectId = fixture.ids.project
  store.set(pgliteDbAtom, db)
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

beforeEach(() => {
  store.set(operationsQueueAtom, [])
  vi.mocked(getCapabilities).mockReset()
})

const wmsService = async (id: string, info_format: string | null = null) => {
  const res = await db.query<WmsServices>(
    `INSERT INTO wms_services (wms_service_id, project_id, url, info_format)
     VALUES ($1, $2, 'https://example.com/wms', $3) RETURNING *`,
    [id, projectId, info_format],
  )
  return res.rows[0]!
}

const wfsService = async (id: string) => {
  const res = await db.query<WfsServices>(
    `INSERT INTO wfs_services (wfs_service_id, project_id, url)
     VALUES ($1, $2, 'https://example.com/wfs') RETURNING *`,
    [id, projectId],
  )
  return res.rows[0]!
}

const storedFormats = async (
  table: 'wms_services' | 'wfs_services',
  idColumn: string,
  id: string,
) =>
  (
    await db.query(
      `SELECT info_format, info_formats FROM ${table} WHERE ${idColumn} = $1`,
      [id],
    )
  ).rows[0]

describe('getWmsCapabilitiesData', () => {
  it('stores GeoJSON as the format to ask for first', async () => {
    const id = '70000000-0000-7000-8000-00000000f001'
    vi.mocked(getCapabilities).mockResolvedValue(
      wmsCapabilitiesWith(AARGAU_GEOSERVER),
    )

    await getWmsCapabilitiesData({
      wmsLayer: null,
      service: await wmsService(id),
    })

    expect(await storedFormats('wms_services', 'wms_service_id', id)).toEqual({
      info_format: 'application/json',
      info_formats: AARGAU_GEOSERVER,
    })
  })

  it('finds GeoJSON under the name ArcGIS Server gives it', async () => {
    const id = '70000000-0000-7000-8000-00000000f002'
    vi.mocked(getCapabilities).mockResolvedValue(
      wmsCapabilitiesWith(BERN_ARCGIS),
    )

    await getWmsCapabilitiesData({
      wmsLayer: null,
      service: await wmsService(id),
    })

    expect(
      (await storedFormats('wms_services', 'wms_service_id', id)).info_format,
    ).toBe('application/geo+json')
  })

  it('keeps the format a service already has', async () => {
    const id = '70000000-0000-7000-8000-00000000f003'
    vi.mocked(getCapabilities).mockResolvedValue(
      wmsCapabilitiesWith(BERN_ARCGIS),
    )

    await getWmsCapabilitiesData({
      wmsLayer: null,
      service: await wmsService(id, 'text/plain'),
    })

    expect(
      (await storedFormats('wms_services', 'wms_service_id', id)).info_format,
    ).toBe('text/plain')
  })
})

describe('getWfsCapabilitiesData', () => {
  const vectorLayer = (id: string) =>
    ({
      vector_layer_id: null,
      project_id: projectId,
      wfs_service_id: id,
      wfs_service_layer_name: null,
    }) as unknown as VectorLayers

  it('picks GeoJSON whatever it is called, also when the gml ones come first', async () => {
    const id = '80000000-0000-7000-8000-00000000f001'
    vi.mocked(getCapabilities).mockResolvedValue(
      wfsCapabilitiesWith(GLARUS_QGIS_WFS),
    )

    await getWfsCapabilitiesData({
      vectorLayer: vectorLayer(id),
      service: await wfsService(id),
    })

    expect(await storedFormats('wfs_services', 'wfs_service_id', id)).toEqual({
      info_format: 'application/vnd.geo+json',
      info_formats: GLARUS_QGIS_WFS,
    })
  })

  it('falls back to gml when a service offers no json', async () => {
    const id = '80000000-0000-7000-8000-00000000f002'
    vi.mocked(getCapabilities).mockResolvedValue(
      wfsCapabilitiesWith(SCHWYZ_MAPSERVER_WFS),
    )

    await getWfsCapabilitiesData({
      vectorLayer: vectorLayer(id),
      service: await wfsService(id),
    })

    expect(
      (await storedFormats('wfs_services', 'wfs_service_id', id)).info_format,
    ).toBe('application/gml+xml; version=3.2')
  })
})
