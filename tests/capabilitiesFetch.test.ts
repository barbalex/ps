import { describe, expect, it, beforeAll, beforeEach, vi } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'

import { createTestDb } from './helpers/createTestDb.ts'

/**
 * getWmsCapabilitiesData/getWfsCapabilitiesData insert every layer of a
 * service with fresh uuids. The manual fetch button and the layout-wide
 * AutoFetchCapabilities can both observe a freshly added service with zero
 * layers while the other fetch's network request is still in flight — the
 * per-service guard must let only one of them insert, otherwise every layer
 * ends up twice (duplicate dropdown entries and duplicate React keys).
 * These tests race two fetches for the same service.
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

const WMS_SERVICE = '70000000-0000-7000-8000-00000000000a'
const WMS_SERVICE_AGAIN = '70000000-0000-7000-8000-00000000000b'
const WFS_SERVICE = '80000000-0000-7000-8000-00000000000a'
const WFS_SERVICE_AGAIN = '80000000-0000-7000-8000-00000000000b'

// the shape WMSCapabilities().parse() returns (getCapabilities is mocked)
const wmsCapabilities = {
  version: '1.3.0',
  Capability: {
    Request: {
      GetMap: { Format: ['image/png'] },
      GetFeatureInfo: { Format: ['application/vnd.ogc.gml', 'text/plain'] },
    },
    Layer: {
      Layer: [
        {
          Name: 'test.wms.one',
          Title: 'One',
          queryable: true,
          CRS: ['EPSG:4326'],
        },
        {
          Name: 'test.wms.two',
          Title: 'Two',
          queryable: false,
          CRS: ['EPSG:4326', 'EPSG:2056'],
        },
        // no EPSG:4326 — must not be inserted
        { Name: 'test.wms.no-4326', Title: 'No 4326', CRS: ['EPSG:2056'] },
      ],
    },
  },
}

// the shape xmlToJson(DOMParser…) returns for a WMS capabilities document
const wfsCapabilities = {
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
                  'OWS:VALUE': [{ '#text': 'application/json' }],
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
              OTHERCRS: [{ '#text': 'EPSG:4326' }],
              OUTPUTFORMATS: { FORMAT: [{ '#text': 'application/json' }] },
            },
            {
              NAME: { '#text': 'test.wfs.two' },
              TITLE: { '#text': 'Two' },
              DEFAULTCRS: { '#text': 'urn:ogc:def:crs:EPSG::4326' },
              OTHERCRS: [{ '#text': 'EPSG:4326' }],
              OUTPUTFORMATS: { FORMAT: [{ '#text': 'application/json' }] },
            },
          ],
        },
      },
    },
  },
}

let db: PGlite
let projectId: string

beforeAll(async () => {
  const fixture = await createTestDb()
  db = fixture.db
  projectId = fixture.ids.project
  store.set(pgliteDbAtom, db)

  vi.mocked(getCapabilities).mockImplementation(async ({ service }) =>
    service === 'WMS' ? wmsCapabilities : wfsCapabilities,
  )
})

beforeEach(() => {
  store.set(operationsQueueAtom, [])
})

const insertWmsService = async (wms_service_id: string) => {
  const res = await db.query<WmsServices>(
    `INSERT INTO wms_services (wms_service_id, project_id, url)
     VALUES ($1, $2, 'https://example.com/wms') RETURNING *`,
    [wms_service_id, projectId],
  )
  return res.rows[0]!
}

const insertWfsService = async (wfs_service_id: string) => {
  const res = await db.query<WfsServices>(
    `INSERT INTO wfs_services (wfs_service_id, project_id, url)
     VALUES ($1, $2, 'https://example.com/wfs') RETURNING *`,
    [wfs_service_id, projectId],
  )
  return res.rows[0]!
}

const layerNames = (table: string, serviceColumn: string, serviceId: string) =>
  db
    .query<{ name: string }>(
      `SELECT name FROM ${table} WHERE ${serviceColumn} = $1 ORDER BY name`,
      [serviceId],
    )
    .then((res) => res.rows.map((row) => row.name))

describe('getWmsCapabilitiesData', () => {
  it('inserts a single batch of layers when two fetches race', async () => {
    const service = await insertWmsService(WMS_SERVICE)

    const [first, second] = await Promise.all([
      getWmsCapabilitiesData({ wmsLayer: null, service }),
      getWmsCapabilitiesData({ wmsLayer: null, service }),
    ])

    // one fetch ran (returns false), the other returned early (undefined)
    expect(new Set([first, second])).toEqual(new Set([false, undefined]))

    expect(
      await layerNames('wms_service_layers', 'wms_service_id', WMS_SERVICE),
    ).toEqual(['test.wms.one', 'test.wms.two'])

    // exactly one insertMany operation was queued, not one per racer
    const queuedLayerOps = store
      .get(operationsQueueAtom)
      .filter((op) => op.table === 'wms_service_layers')
    expect(
      queuedLayerOps.filter((op) => op.operation === 'insertMany'),
    ).toHaveLength(1)
  })

  it('replaces the layers when a second fetch runs after the first completed', async () => {
    // the shape of the reported bug: AutoFetchCapabilities populates the
    // layers, the manual fetch button's fetch starts right AFTER it — not
    // concurrently, so only replace-on-insert can keep the layers unique
    const service = await insertWmsService(WMS_SERVICE_AGAIN)

    await getWmsCapabilitiesData({ wmsLayer: null, service })
    const result = await getWmsCapabilitiesData({ wmsLayer: null, service })

    expect(result).toBe(false)
    expect(
      await layerNames(
        'wms_service_layers',
        'wms_service_id',
        WMS_SERVICE_AGAIN,
      ),
    ).toEqual(['test.wms.one', 'test.wms.two'])
  })
})

describe('getWfsCapabilitiesData', () => {
  it('inserts a single batch of layers when two fetches race', async () => {
    const service = await insertWfsService(WFS_SERVICE)
    const vectorLayer = {
      vector_layer_id: null,
      project_id: projectId,
      wfs_service_id: WFS_SERVICE,
      wfs_service_layer_name: null,
    } as unknown as VectorLayers

    await Promise.all([
      getWfsCapabilitiesData({ vectorLayer, service }),
      getWfsCapabilitiesData({ vectorLayer, service }),
    ])

    expect(
      await layerNames('wfs_service_layers', 'wfs_service_id', WFS_SERVICE),
    ).toEqual(['test.wfs.one', 'test.wfs.two'])

    // one insert operation per layer, not one per racer
    const queuedLayerOps = store
      .get(operationsQueueAtom)
      .filter((op) => op.table === 'wfs_service_layers')
    expect(
      queuedLayerOps.filter((op) => op.operation === 'insert'),
    ).toHaveLength(2)
  })

  it('replaces the layers when a second fetch runs after the first completed', async () => {
    const service = await insertWfsService(WFS_SERVICE_AGAIN)
    const vectorLayer = {
      vector_layer_id: null,
      project_id: projectId,
      wfs_service_id: WFS_SERVICE_AGAIN,
      wfs_service_layer_name: null,
    } as unknown as VectorLayers

    await getWfsCapabilitiesData({ vectorLayer, service })
    await getWfsCapabilitiesData({ vectorLayer, service })

    expect(
      await layerNames('wfs_service_layers', 'wfs_service_id', WFS_SERVICE_AGAIN),
    ).toEqual(['test.wfs.one', 'test.wfs.two'])
  })
})
