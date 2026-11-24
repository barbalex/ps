// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The format lists services advertise are not reliable: a canton's GeoServer lists
 * two gml/3.1.1 formats and answers 500 to both. And wms servers answer a format
 * they do not support with an exception report — at status 200. fetchFeatureInfo
 * therefore tries the formats in rank order until the server accepts one — and
 * remembers the one that worked, so only the first click pays for the probing.
 */

vi.mock('../src/modules/httpGet.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/modules/httpGet.ts')>()),
  httpGet: vi.fn(),
}))

import { httpGet, NetworkError } from '../src/modules/httpGet.ts'
import { fetchFeatureInfo } from '../src/components/Map/ClickListener/fetchFeatureInfo.ts'
import { notificationsAtom, shortTermOnlineAtom, store } from '../src/store.ts'

const URL = 'https://example.com/wms'

// the GetFeatureInfo formats an ArcGIS Server advertised (Kanton Bern, 2026-11-24).
// How the server answers in the tests below is simulated
const ARC_GIS_FORMATS = [
  'application/geo+json',
  'application/vnd.esri.wms_featureinfo_xml',
  'application/vnd.esri.wms_raw_xml',
  'application/vnd.ogc.wms_xml',
  'text/html',
  'text/plain',
  'text/xml',
]

const REJECTED = `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<ServiceExceptionReport version="1.3.0" xmlns="http://www.opengis.net/ogc">
  <ServiceException code="InvalidFormat">
 Parameter 'InfoFormat' contains unacceptable value.
 </ServiceException>
</ServiceExceptionReport>`

const CONTINENT = `<?xml version="1.0" encoding="UTF-8"?>
<FeatureInfoResponse xmlns="http://www.esri.com/wms">
  <FIELDS OBJECTID="1" CONTINENT="Africa"></FIELDS>
</FeatureInfoResponse>`

const GML = `<?xml version="1.0" encoding="UTF-8"?>
<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:ms="http://mapserver.gis.umn.edu/mapserver">
  <gml:featureMember><ms:site><ms:name>One</ms:name></ms:site></gml:featureMember>
</wfs:FeatureCollection>`

const ok = (data: unknown) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  url: URL,
  data,
})
const serverError = () => ({
  ok: false,
  status: 500,
  statusText: 'Internal Server Error',
  url: URL,
  data: { status: 999 },
})

const request = (overrides: Partial<Parameters<typeof fetchFeatureInfo>[0]>) =>
  fetchFeatureInfo({
    url: URL,
    params: { service: 'WMS', request: 'GetFeatureInfo' },
    formatParam: 'info_format',
    serviceKey: expect.getState().currentTestName,
    infoFormats: ARC_GIS_FORMATS,
    fallback: ['application/json', 'text/plain'],
    layerLabel: 'Continents',
    ...overrides,
  })

const askedFor = (formatParam: string) =>
  vi.mocked(httpGet).mock.calls.map(([, params]) => params?.[formatParam])

const notifications = () =>
  store.get(notificationsAtom).map(({ title, body }) => [title, body])

beforeEach(() => {
  vi.mocked(httpGet).mockReset()
  store.set(notificationsAtom, [])
  store.set(shortTermOnlineAtom, true)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('fetchFeatureInfo', () => {
  it('asks for the formats in rank order until the server accepts one', async () => {
    vi.mocked(httpGet).mockImplementation(async (_url, params) =>
      params?.info_format === 'application/geo+json' ?
        ok(REJECTED)
      : ok(CONTINENT),
    )

    expect(await request({})).toEqual([
      {
        properties: [
          ['OBJECTID', '1'],
          ['CONTINENT', 'Africa'],
        ],
      },
    ])
    expect(askedFor('info_format')).toEqual([
      'application/geo+json',
      'application/vnd.esri.wms_featureinfo_xml',
    ])
    // the rejected format is not worth a message
    expect(notifications()).toEqual([])
  })

  it('asks first for the format that worked last time', async () => {
    vi.mocked(httpGet).mockImplementation(async (_url, params) =>
      params?.info_format === 'application/geo+json' ?
        ok(REJECTED)
      : ok(CONTINENT),
    )
    await request({})
    vi.mocked(httpGet).mockClear()

    await request({})

    expect(askedFor('info_format')).toEqual([
      'application/vnd.esri.wms_featureinfo_xml',
    ])
  })

  it('falls back when the server answers with an error status', async () => {
    vi.mocked(httpGet).mockImplementation(async (_url, params) =>
      params?.info_format === 'application/json' ? serverError() : ok(GML),
    )

    // a service that only kept the format once picked for it gets the
    // defaults after it
    expect(
      await request({ infoFormat: 'application/json', infoFormats: null }),
    ).toEqual([{ properties: [['name', 'One']] }])
    expect(askedFor('info_format')).toEqual(['application/json', 'text/plain'])
  })

  it('reports the last error once when every format fails', async () => {
    vi.mocked(httpGet).mockImplementation(async () => serverError())

    expect(await request({ infoFormats: null })).toBeUndefined()
    expect(askedFor('info_format')).toEqual(['application/json', 'text/plain'])
    expect(notifications()).toEqual([
      [
        'Fehler beim Laden der Informationen für Continents',
        '500 Internal Server Error',
      ],
    ])
  })

  it('stops at an exception that is not about the format', async () => {
    vi.mocked(httpGet).mockImplementation(async () =>
      ok(
        `<ServiceExceptionReport version="1.3.0" xmlns="http://www.opengis.net/ogc"><ServiceException code="LayerNotDefined">Layer(s) specified in QUERY_LAYERS parameter is not offered by the service instance.</ServiceException></ServiceExceptionReport>`,
      ),
    )

    expect(await request({})).toBeUndefined()
    expect(askedFor('info_format')).toHaveLength(1)
    expect(notifications()).toEqual([
      [
        'Fehler beim Laden der Informationen für Continents',
        'LayerNotDefined: Layer(s) specified in QUERY_LAYERS parameter is not offered by the service instance.',
      ],
    ])
  })

  it('reports a network failure without asking for other formats', async () => {
    vi.mocked(httpGet).mockRejectedValue(new NetworkError('Failed to fetch'))

    expect(await request({})).toBeUndefined()
    expect(askedFor('info_format')).toHaveLength(1)
    expect(notifications()).toEqual([
      ['Fehler beim Laden der Informationen für Continents', 'Failed to fetch'],
    ])
    // the offline detection still sees the error
    expect(store.get(shortTermOnlineAtom)).toBe(false)
  })

  it('finds nothing where the user clicked and says nothing', async () => {
    vi.mocked(httpGet).mockImplementation(async () => ({
      ok: false,
      status: 406,
      statusText: 'Not Acceptable',
      url: URL,
      data: '',
    }))

    expect(await request({})).toBeUndefined()
    expect(askedFor('info_format')).toHaveLength(1)
    expect(notifications()).toEqual([])
  })

  it('asks a wfs that advertises no format for nothing, so it answers gml', async () => {
    vi.mocked(httpGet).mockImplementation(async () => ok(GML))

    const layersData = await request({
      formatParam: 'outputFormat',
      infoFormat: null,
      infoFormats: null,
      fallback: [undefined],
    })

    expect(layersData).toEqual([{ properties: [['name', 'One']] }])
    expect(vi.mocked(httpGet).mock.calls[0]![1]).toEqual({
      service: 'WMS',
      request: 'GetFeatureInfo',
    })
  })

  it('asks a wfs for no format once the ones it advertises are rejected', async () => {
    vi.mocked(httpGet).mockImplementation(async (_url, params) =>
      params?.outputFormat ? ok(REJECTED) : ok(GML),
    )

    const layersData = await request({
      formatParam: 'outputFormat',
      infoFormats: ['application/json; subtype=geojson'],
      fallback: [undefined],
    })

    expect(layersData).toEqual([{ properties: [['name', 'One']] }])
    expect(askedFor('outputFormat')).toEqual([
      'application/json; subtype=geojson',
      undefined,
    ])
    expect(notifications()).toEqual([])
  })
})
