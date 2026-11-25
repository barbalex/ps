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
import {
  fetchPendingCapabilities,
  seenWmsKey,
} from '../src/modules/autoFetchCapabilities.ts'
import { backgroundTasks } from '../src/modules/backgroundTasks.ts'
import { NetworkError } from '../src/modules/httpGet.ts'
import { operationsQueueAtom, pgliteDbAtom, store } from '../src/store.ts'
import type WmsServices from '../src/models/public/WmsServices.ts'
import type WfsServices from '../src/models/public/WfsServices.ts'
import type VectorLayers from '../src/models/public/VectorLayers.ts'

const WMS_SERVICE = '70000000-0000-7000-8000-00000000000a'
const WMS_SERVICE_AGAIN = '70000000-0000-7000-8000-00000000000b'
const WMS_SERVICE_AUTO = '70000000-0000-7000-8000-00000000000c'
const WMS_SERVICE_AUTO_SEEN = '70000000-0000-7000-8000-000000000010'
const WMS_SERVICE_AUTO_LAYERS = '70000000-0000-7000-8000-00000000000d'
const WMS_SERVICE_AUTO_NETWORK = '70000000-0000-7000-8000-00000000000e'
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
            // 4326 only as the primary crs — no OtherCRS at all
            {
              NAME: { '#text': 'test.wfs.default-crs-only' },
              TITLE: { '#text': 'Default CRS only' },
              DEFAULTCRS: { '#text': 'urn:ogc:def:crs:EPSG::4326' },
              OUTPUTFORMATS: { FORMAT: [{ '#text': 'application/json' }] },
            },
            // no 4326 anywhere — must not be inserted
            {
              NAME: { '#text': 'test.wfs.no-4326' },
              TITLE: { '#text': 'No 4326' },
              DEFAULTCRS: { '#text': 'urn:ogc:def:crs:EPSG::2056' },
              OTHERCRS: [{ '#text': 'EPSG:2056' }],
              OUTPUTFORMATS: { FORMAT: [{ '#text': 'application/json' }] },
            },
            // no acceptable output format — must not be inserted
            {
              NAME: { '#text': 'test.wfs.bad-format' },
              TITLE: { '#text': 'Bad format' },
              DEFAULTCRS: { '#text': 'urn:ogc:def:crs:EPSG::4326' },
              OTHERCRS: [{ '#text': 'EPSG:4326' }],
              OUTPUTFORMATS: { FORMAT: [{ '#text': 'text/csv' }] },
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

  // AutoFetchCapabilities' seen markers live in this local-only table
  // (created by SqlInitializer in the app, not part of the schema files)
  await db.exec(
    `CREATE TABLE IF NOT EXISTS _ps_local_meta(key text PRIMARY KEY, value text)`,
  )

  // complete/error arm auto-removal timers — stub them so no timers are left
  // behind, while add/updateProgress keep spying on real calls
  vi.spyOn(backgroundTasks, 'add')
  vi.spyOn(backgroundTasks, 'complete').mockImplementation(() => undefined)
  vi.spyOn(backgroundTasks, 'error').mockImplementation(() => undefined)

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
    ).toEqual(['test.wfs.default-crs-only', 'test.wfs.one', 'test.wfs.two'])

    // one insert operation per layer, not one per racer
    const queuedLayerOps = store
      .get(operationsQueueAtom)
      .filter((op) => op.table === 'wfs_service_layers')
    expect(
      queuedLayerOps.filter((op) => op.operation === 'insert'),
    ).toHaveLength(3)
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
      await layerNames(
        'wfs_service_layers',
        'wfs_service_id',
        WFS_SERVICE_AGAIN,
      ),
    ).toEqual(['test.wfs.default-crs-only', 'test.wfs.one', 'test.wfs.two'])
  })
})

/**
 * fetchPendingCapabilities is AutoFetchCapabilities' engine (the component
 * only wires the live queries): fetch capabilities once per browser for
 * every service that syncs in without layers. Seen markers live in the
 * local-only _ps_local_meta table; network errors stay unseen (retried on
 * the next load), terminal failures are marked seen.
 */
describe('fetchPendingCapabilities', () => {
  const serviceUrl = 'https://example.com/wms'

  const run = async (
    serviceId: string | null,
    fetchCapabilities: ReturnType<typeof vi.fn>,
  ) => {
    await fetchPendingCapabilities({
      db,
      inFlight: new Set(),
      taskId: 'auto-fetch-wms-capabilities',
      taskName: 'Fetching WMS capabilities',
      failureMessage: 'Failed to fetch some WMS capabilities',
      layerTable: 'wms_service_layers',
      serviceIdColumn: 'wms_service_id',
      services:
        serviceId === null ? [] : [{ id: serviceId, url: serviceUrl, projectId }],
      seenKeyOf: (service) => seenWmsKey(service.id, service.url),
      fetchCapabilities,
    })
  }

  const isSeen = (serviceId: string) =>
    db
      .query<{ count: number | string }>(
        `SELECT count(*) AS count FROM _ps_local_meta WHERE key = $1`,
        [seenWmsKey(serviceId, serviceUrl)],
      )
      .then((res) => Number(res.rows[0]?.count ?? 0) > 0)

  beforeEach(() => {
    vi.clearAllMocks()
    // restore the through-implementations cleared by clearAllMocks
    vi.mocked(getCapabilities).mockImplementation(async ({ service }) =>
      service === 'WMS' ? wmsCapabilities : wfsCapabilities,
    )
  })

  it('skips the database lookup when no services have a URL', async () => {
    const query = vi.spyOn(db, 'query')
    try {
      await run(null, vi.fn())
      expect(query).not.toHaveBeenCalled()
      expect(backgroundTasks.add).not.toHaveBeenCalled()
    } finally {
      query.mockRestore()
    }
  })

  it('fetches an unseen service with zero layers and marks it seen', async () => {
    await insertWmsService(WMS_SERVICE_AUTO)
    const fetchCapabilities = vi.fn().mockResolvedValue(undefined)

    await run(WMS_SERVICE_AUTO, fetchCapabilities)

    expect(fetchCapabilities).toHaveBeenCalledTimes(1)
    expect(fetchCapabilities.mock.calls[0]?.[0]).toMatchObject({
      id: WMS_SERVICE_AUTO,
      url: serviceUrl,
      projectId,
    })
    expect(await isSeen(WMS_SERVICE_AUTO)).toBe(true)
    expect(backgroundTasks.add).toHaveBeenCalledWith(
      'auto-fetch-wms-capabilities',
      'Fetching WMS capabilities',
      1,
    )
    expect(backgroundTasks.complete).toHaveBeenCalledWith(
      'auto-fetch-wms-capabilities',
    )
  })

  it('does not fetch again once the service is seen', async () => {
    await insertWmsService(WMS_SERVICE_AUTO_SEEN)
    const fetchCapabilities = vi.fn().mockResolvedValue(undefined)

    await run(WMS_SERVICE_AUTO_SEEN, fetchCapabilities)
    expect(fetchCapabilities).toHaveBeenCalledTimes(1)

    // the next load: the marker exists, nothing is pending anymore
    vi.clearAllMocks()
    await run(WMS_SERVICE_AUTO_SEEN, fetchCapabilities)

    // vi.clearAllMocks reset the call count — zero calls means not fetched again
    expect(fetchCapabilities).toHaveBeenCalledTimes(0)
    expect(backgroundTasks.add).not.toHaveBeenCalled()
    expect(backgroundTasks.complete).not.toHaveBeenCalled()
    expect(await isSeen(WMS_SERVICE_AUTO_SEEN)).toBe(true)
  })

  it('marks a service that already has layers seen without fetching', async () => {
    await insertWmsService(WMS_SERVICE_AUTO_LAYERS)
    await db.query(
      `INSERT INTO wms_service_layers (wms_service_id, name) VALUES ($1, 'layer.one')`,
      [WMS_SERVICE_AUTO_LAYERS],
    )
    const fetchCapabilities = vi.fn().mockResolvedValue(undefined)

    await run(WMS_SERVICE_AUTO_LAYERS, fetchCapabilities)

    expect(fetchCapabilities).not.toHaveBeenCalled()
    expect(await isSeen(WMS_SERVICE_AUTO_LAYERS)).toBe(true)
  })

  it('retries network errors but marks terminal failures seen', async () => {
    await insertWmsService(WMS_SERVICE_AUTO_NETWORK)
    const fetchCapabilities = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError('Failed to fetch'))
      .mockRejectedValueOnce(new Error('404 Not Found'))

    // first load: network error — transient, service stays unseen
    await run(WMS_SERVICE_AUTO_NETWORK, fetchCapabilities)
    expect(await isSeen(WMS_SERVICE_AUTO_NETWORK)).toBe(false)

    // second load: terminal error — marked seen, no retry on further loads
    await run(WMS_SERVICE_AUTO_NETWORK, fetchCapabilities)
    expect(fetchCapabilities).toHaveBeenCalledTimes(2)
    expect(await isSeen(WMS_SERVICE_AUTO_NETWORK)).toBe(true)
    expect(backgroundTasks.error).toHaveBeenCalledWith(
      'auto-fetch-wms-capabilities',
      'Failed to fetch some WMS capabilities',
    )
  })
})
