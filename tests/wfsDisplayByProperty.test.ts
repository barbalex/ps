import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type VectorLayerDisplays from '../src/models/public/VectorLayerDisplays.ts'
import type { XmlElement } from '../src/modules/wfsDisplayByProperty.ts'

/**
 * "Anzeigen nach" for wfs layers (dev-doc section 10): the fields come from
 * the service's schema, the values of a field from GetPropertyValue (wfs 2.0)
 * or, failing that, from the features the layer has loaded. The parsers are
 * pure; the requests run against a mocked fetch and DOM; the display sync
 * runs against a real in-memory Postgres loaded with the app's schema.
 * store.ts is imported dynamically (same pattern as displayByProperty.test).
 */

type WfsModule = typeof import('../src/modules/wfsDisplayByProperty.ts')
type DisplayByModule = typeof import('../src/modules/displayByProperty.ts')
type SyncModule =
  typeof import('../src/formsAndLists/vectorLayer/Form/syncWfsLayerDisplays.ts')
type TestFixture = Awaited<
  ReturnType<typeof import('./helpers/createTestDb.ts').createTestDb>
>

// the thinnest DOM the module's xml walker reads: nodeType, names,
// attributes, childNodes.item() and textContent. Built by tokenizing the
// simple xml the tests feed (no comments, no cdata, no "<" in attribute values)
type FakeNode = {
  nodeType: number
  nodeName: string
  localName: string
  attributes: { name: string; value: string }[]
  childNodes: FakeNode[] & { item(index: number): FakeNode | null }
  textContent: string
}

const noChildNodes = () => {
  const childNodes = [] as FakeNode['childNodes']
  childNodes.item = (index) => childNodes[index] ?? null
  return childNodes
}

const element = (qualifiedName: string, attributeText: string): FakeNode => {
  const childNodes = noChildNodes()
  return {
    nodeType: 1,
    nodeName: qualifiedName,
    localName: qualifiedName.split(':').pop()!,
    attributes: [...attributeText.matchAll(/([\w:.-]+)="([^"]*)"/g)].map(
      ([, name, value]) => ({ name: name!, value: value! }),
    ),
    childNodes,
    get textContent() {
      return childNodes.map((child) => child.textContent).join('')
    },
  }
}

const parseFakeXml = (xml: string) => {
  const documentElement = element('#document', '')
  const stack = [documentElement]
  for (const token of xml.match(/<[^>]+>|[^<]+/g) ?? []) {
    const parent = stack.at(-1)!
    if (token.startsWith('<?')) continue
    if (token.startsWith('</')) {
      stack.pop()
      continue
    }
    if (!token.startsWith('<')) {
      parent.childNodes.push({
        nodeType: 3,
        nodeName: '#text',
        localName: '',
        attributes: [],
        childNodes: noChildNodes(),
        textContent: token,
      })
      continue
    }
    const inner = token.slice(1, -1).replace(/\/$/, '')
    const qualifiedName = inner.split(/\s+/)[0]!
    const child = element(qualifiedName, inner.slice(qualifiedName.length))
    parent.childNodes.push(child)
    if (!token.endsWith('/>')) stack.push(child)
  }
  // as in a browser: the document's element is the root element — not the
  // document, nor the whitespace or prologue before it
  const root = documentElement.childNodes.find((child) => child.nodeType === 1)
  return { documentElement: root }
}

class FakeDOMParser {
  parseFromString(xml: string) {
    return parseFakeXml(xml)
  }
}

type Answer = { body: string; status?: number; statusText?: string }
// what the service answers: per request url
let respond: (url: URL) => Answer
const fetchMock = vi.fn(async (input: string | URL | Request) => {
  const url = new URL(String(input))
  const { body, status = 200, statusText = '' } = respond(url)
  return new Response(body, { status, statusText })
})
const requestedUrls = () =>
  fetchMock.mock.calls.map(([input]) => new URL(String(input)))
// a service that delivers the given schema and the values of one field
const serviceAnswering =
  (schema: string, values: (string | null)[]): ((url: URL) => Answer) =>
  (url) => ({
    body:
      url.searchParams.get('request') === 'DescribeFeatureType' ?
        schema
      : valueCollection(values),
  })

const SERVICE = 'https://maps.example.ch/wfs/OaksWFS'
const TYPE_NAME = 'ms:oaks'

// an element of an xml document; a string child is text
const el = (
  local: string,
  attrs: Record<string, string> = {},
  ...children: (XmlElement | string)[]
): XmlElement => ({
  name: local,
  local,
  attrs,
  children: children.filter(
    (child): child is XmlElement => typeof child === 'object',
  ),
  text: children
    .map((child) => (typeof child === 'string' ? child : child.text))
    .join(''),
})

// the answers of mapserver (zh), reduced to what parsing depends on
const MAPSERVER_SCHEMA = `<?xml version='1.0' encoding="UTF-8" ?>
<schema targetNamespace="http://mapserver.gis.umn.edu/mapserver"
   xmlns:ms="http://mapserver.gis.umn.edu/mapserver"
   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
   xmlns="http://www.w3.org/2001/XMLSchema"
   xmlns:gml="http://www.opengis.net/gml/3.2"
   elementFormDefault="qualified" version="0.1">
  <import namespace="http://www.opengis.net/gml/3.2" schemaLocation="http://schemas.opengis.net/gml/3.2.1/gml.xsd" />
  <element name="oaks" type="ms:oaksType" substitutionGroup="gml:AbstractFeature" />
  <complexType name="oaksType">
    <complexContent>
      <extension base="gml:AbstractFeatureType">
        <sequence>
          <element name="geometry" type="gml:MultiSurfacePropertyType" minOccurs="0" maxOccurs="1"/>
          <element name="status" minOccurs="0" type="integer"/>
          <element name="nattyp" minOccurs="0" type="integer"/>
          <element name="lmutdat" minOccurs="0" type="gml:TimeInstantType"/>
          <element name="bemerkungen" minOccurs="0" type="string"/>
          <element name="geodb_oid" minOccurs="0" type="integer"/>
        </sequence>
      </extension>
    </complexContent>
  </complexType>
</schema>`

// mapserver answering a wfs 1.1 request: no prefix on the schema's own tags
const UNPREFIXED_SCHEMA = `<schema xmlns:ms="http://mapserver.gis.umn.edu/mapserver" xmlns:gml="http://www.opengis.net/gml" xmlns="http://www.w3.org/2001/XMLSchema">
  <element name="oaks" type="ms:oaksType"/>
  <complexType name="oaksType">
    <complexContent>
      <extension base="gml:AbstractFeatureType">
        <sequence>
          <element name="geometry" type="gml:MultiSurfacePropertyType" minOccurs="0" maxOccurs="1"/>
          <element name="status" minOccurs="0" type="integer"/>
        </sequence>
      </extension>
    </complexContent>
  </complexType>
</schema>`

// geoserver: the type before the element declaring it, properties that are
// no single simple value, a gml 3.2 geometry
const GEOSERVER_SCHEMA = `<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:topp="http://www.openplans.org/topp" elementFormDefault="qualified" targetNamespace="http://www.openplans.org/topp">
  <xsd:complexType name="statesType">
    <xsd:complexContent>
      <xsd:extension base="gml:AbstractFeatureType">
        <xsd:sequence>
          <xsd:element name="the_geom" type="gml:MultiPolygonPropertyType" minOccurs="0" maxOccurs="1"/>
          <xsd:element name="STATE_NAME" type="xsd:string"/>
          <xsd:element name="PERSONS" type="xsd:double"/>
          <xsd:element name="detail" minOccurs="0">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name="street" type="xsd:string"/>
              </xsd:sequence>
            </xsd:complexType>
          </xsd:element>
          <xsd:element name="alias" type="xsd:string" maxOccurs="unbounded"/>
          <xsd:element name="centre" type="gml:GeometryAssociationRole"/>
        </xsd:sequence>
      </xsd:extension>
    </xsd:complexContent>
  </xsd:complexType>
  <xsd:element name="states" type="topp:statesType" substitutionGroup="gml:_Feature"/>
</xsd:schema>`

// the feature type declared inline, with no type of its own
const INLINE_TYPE_SCHEMA = `<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:gml="http://www.opengis.net/gml/3.2">
  <xsd:element name="lakes" substitutionGroup="gml:AbstractFeature">
    <xsd:complexType>
      <xsd:complexContent>
        <xsd:extension base="gml:AbstractFeatureType">
          <xsd:sequence>
            <xsd:element name="geom" type="gml:GeometryAssociationRole"/>
            <xsd:element name="name" type="xsd:string"/>
            <xsd:element name="depth" type="xsd:double"/>
          </xsd:sequence>
        </xsd:extension>
      </xsd:complexContent>
    </xsd:complexType>
  </xsd:element>
</xsd:schema>`

// a GetPropertyValue answer; null is a feature without a value
const valueCollection = (
  values: (string | null)[],
  attrs = '',
  children = '',
) =>
  `<?xml version='1.0' encoding="UTF-8" ?>
<wfs:ValueCollection xmlns:ms="http://mapserver.gis.umn.edu/mapserver" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" numberMatched="${values.length}" numberReturned="${values.length}" ${attrs}>
  ${values
    .map((value) =>
      value === null ?
        '<wfs:member><ms:value xsi:nil="true"/></wfs:member>'
      : `<wfs:member><ms:value>${value}</ms:value></wfs:member>`,
    )
    .join('\n  ')}
  ${children}
</wfs:ValueCollection>`

const numbersUpTo = (count: number) =>
  Array.from({ length: count }, (_, index) => String(index))

let wfs: WfsModule
let displayBy: DisplayByModule
let sync: SyncModule
let db: TestFixture['db']
let ids: TestFixture['ids']
let storeModule: typeof import('../src/store.ts')

beforeAll(async () => {
  wfs = await import('../src/modules/wfsDisplayByProperty.ts')
  displayBy = await import('../src/modules/displayByProperty.ts')
  sync =
    await import('../src/formsAndLists/vectorLayer/Form/syncWfsLayerDisplays.ts')
  storeModule = await import('../src/store.ts')
  const { createTestDb } = await import('./helpers/createTestDb.ts')
  const fixture = await createTestDb()
  db = fixture.db
  ids = fixture.ids
  storeModule.store.set(storeModule.pgliteDbAtom, db)
})

beforeEach(() => {
  fetchMock.mockClear()
  // every request is answered "not found" unless a test says otherwise
  respond = () => ({ body: 'unmocked request', status: 404 })
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('window', { DOMParser: FakeDOMParser })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

afterAll(async () => {
  await db?.close()
})

describe('parseWfsFeatureTypeFields', () => {
  const typeName = 'ms:oaks'
  const declaration = el('element', { name: 'oaks', type: 'ms:oaksType' })
  const featureType = (...properties: ReturnType<typeof el>[]) =>
    el(
      'complexType',
      { name: 'oaksType' },
      el(
        'complexContent',
        {},
        el(
          'extension',
          { base: 'gml:AbstractFeatureType' },
          el('sequence', {}, ...properties),
        ),
      ),
    )
  const schemaWith = (
    type: ReturnType<typeof el>,
    ...declarations: ReturnType<typeof el>[]
  ) => el('schema', {}, ...declarations, type)

  it('lists the properties in schema order, without the geometry', () => {
    const schema = schemaWith(
      featureType(
        el('element', { name: 'msGeometry', type: 'gml:PointPropertyType' }),
        el('element', { name: 'status', type: 'integer' }),
        el('element', { name: 'name', type: 'xsd:string' }),
      ),
      declaration,
    )
    expect(wfs.parseWfsFeatureTypeFields(schema, typeName)).toEqual([
      'status',
      'name',
    ])
  })

  it('leaves out properties that are no single simple value', () => {
    const schema = schemaWith(
      featureType(
        el('element', { name: 'geometry', type: 'gml:PointPropertyType' }),
        // nested: a type of its own, or one declared inside
        el('element', { name: 'address', type: 'ms:addressType' }),
        el(
          'element',
          { name: 'detail' },
          el(
            'complexType',
            {},
            el('sequence', {}, el('element', { name: 'x' })),
          ),
        ),
        // repeating
        el('element', {
          name: 'alias',
          type: 'xsd:string',
          maxOccurs: 'unbounded',
        }),
        el('element', { name: 'owners', type: 'xsd:string', maxOccurs: '2' }),
        el('element', { name: 'status', type: 'integer', maxOccurs: '1' }),
        el(
          'complexType',
          { name: 'addressType' },
          el('sequence', {}, el('element', { name: 'street' })),
        ),
      ),
      declaration,
    )
    expect(wfs.parseWfsFeatureTypeFields(schema, typeName)).toEqual(['status'])
  })

  it('knows the gml geometry property types of gml 2, 3 and 3.2', () => {
    const geometryTypes = [
      'gml:GeometryAssociationType',
      'gml:GeometryPropertyType',
      'gml:MultiPolygonPropertyType',
      'gml:MultiSurfacePropertyType',
      'gml:GeometryAssociationRole',
    ]
    const schema = schemaWith(
      featureType(
        ...geometryTypes.map((type, index) =>
          el('element', { name: `geom${index}`, type }),
        ),
        el('element', { name: 'status', type: 'integer' }),
      ),
      declaration,
    )
    expect(wfs.parseWfsFeatureTypeFields(schema, typeName)).toEqual(['status'])
  })

  it('finds the feature type when no element names its type', () => {
    // the common <name>Type
    expect(
      wfs.parseWfsFeatureTypeFields(
        schemaWith(featureType(el('element', { name: 'status' }))),
        typeName,
      ),
    ).toEqual(['status'])
    // or the only feature type of the schema: one type was asked for
    const anonymous = featureType(el('element', { name: 'status' }))
    anonymous.attrs.name = 'whateverType'
    expect(
      wfs.parseWfsFeatureTypeFields(schemaWith(anonymous), typeName),
    ).toEqual(['status'])
  })

  it('is null when the schema does not describe the feature type', () => {
    // two feature types, none matching
    const schema = schemaWith(
      featureType(el('element', { name: 'status' })),
      featureType(el('element', { name: 'other' })),
      declaration,
    )
    expect(wfs.parseWfsFeatureTypeFields(schema, 'ms:missing')).toBeNull()
    expect(wfs.parseWfsFeatureTypeFields(el('html'), typeName)).toBeNull()
  })
})

describe('parseWfsPropertyValues', () => {
  // <wfs:member><ms:value>…</ms:value></wfs:member>; null: no value
  const member = (value: string | null) =>
    el(
      'member',
      {},
      value === null ?
        el('value', { 'xsi:nil': 'true' })
      : el('value', {}, value),
    )
  const collection = (
    attrs: Record<string, string> = {},
    ...children: XmlElement[]
  ) => el('ValueCollection', attrs, ...children)

  it('lists the distinct values in the order read', () => {
    const parsed = wfs.parseWfsPropertyValues(
      collection({}, member('1'), member('3'), member('1'), member('2')),
    )
    expect(parsed.values).toEqual(['1', '3', '2'])
    expect(parsed.read).toBe(4)
    expect(parsed.matched).toBeNull()
    expect(parsed.next).toBe(false)
    expect(parsed.truncated).toBe(false)
  })

  it('tells features without a value from empty ones', () => {
    const parsed = wfs.parseWfsPropertyValues(
      collection({}, member(''), member('x'), member(null), el('member')),
    )
    expect(parsed.values).toEqual(['', 'x', null])
  })

  it('reads what tells whether more values exist', () => {
    expect(
      wfs.parseWfsPropertyValues(
        collection({ numberMatched: '1051', next: 'https://x/2' }, member('1')),
      ),
    ).toMatchObject({ matched: 1051, next: true })
    // a service reporting "unknown" counts tells with a next-page reference
    expect(
      wfs.parseWfsPropertyValues(
        collection(
          { numberMatched: 'unknown' },
          member('1'),
          el('next', { href: 'https://x/2' }),
        ),
      ),
    ).toMatchObject({ matched: null, next: true })
    expect(
      wfs.parseWfsPropertyValues(
        collection({}, member('1'), el('truncatedResponse')),
      ).truncated,
    ).toBe(true)
  })

  it('rejects answers that are no value collection', () => {
    expect(() =>
      wfs.parseWfsPropertyValues(
        el('ExceptionReport', {}, el('Exception', {}, 'not implemented')),
      ),
    ).toThrow('GetPropertyValue answered with <ExceptionReport>')
  })
})

describe('fetchWfsLayerFields', () => {
  it('asks for the layer with typeName on wfs 1.x and typeNames on 2.0', async () => {
    respond = () => ({ body: MAPSERVER_SCHEMA })
    const versions = [
      ['1.0.0', 'typeName'],
      ['1.1.0', 'typeName'],
      [null, 'typeName'],
      ['2.0.0', 'typeNames'],
    ] as const
    for (const [version, parameter] of versions) {
      fetchMock.mockClear()
      expect(
        await wfs.fetchWfsLayerFields({
          url: SERVICE,
          version,
          typeName: TYPE_NAME,
        }),
      ).toEqual(['status', 'nattyp', 'lmutdat', 'bemerkungen', 'geodb_oid'])
      expect(requestedUrls()).toHaveLength(1)
      const params = requestedUrls()[0]!.searchParams
      expect(params.get('service')).toBe('WFS')
      expect(params.get('request')).toBe('DescribeFeatureType')
      expect(params.get(parameter)).toBe(TYPE_NAME)
      expect(params.get('version')).toBe(version)
    }
  })

  it('parses schemas whatever prefixes their server declares', async () => {
    respond = () => ({ body: UNPREFIXED_SCHEMA })
    expect(
      await wfs.fetchWfsLayerFields({
        url: SERVICE,
        version: '1.1.0',
        typeName: TYPE_NAME,
      }),
    ).toEqual(['status'])

    respond = () => ({ body: GEOSERVER_SCHEMA })
    expect(
      await wfs.fetchWfsLayerFields({
        url: SERVICE,
        version: '2.0.0',
        typeName: 'topp:states',
      }),
    ).toEqual(['STATE_NAME', 'PERSONS'])

    respond = () => ({ body: INLINE_TYPE_SCHEMA })
    expect(
      await wfs.fetchWfsLayerFields({
        url: SERVICE,
        version: '2.0.0',
        typeName: 'lakes',
      }),
    ).toEqual(['name', 'depth'])
  })

  it('rejects when the schema cannot be read', async () => {
    respond = () => ({
      body: '<ServiceExceptionReport/>',
      status: 400,
      statusText: 'Bad Request',
    })
    await expect(
      wfs.fetchWfsLayerFields({
        url: SERVICE,
        version: '2.0.0',
        typeName: TYPE_NAME,
      }),
    ).rejects.toThrow('DescribeFeatureType answered 400 Bad Request')

    // http 200, but not the layer's schema
    respond = () => ({ body: '<html><body>Maintenance</body></html>' })
    await expect(
      wfs.fetchWfsLayerFields({
        url: SERVICE,
        version: '2.0.0',
        typeName: TYPE_NAME,
      }),
    ).rejects.toThrow('the schema does not describe the layer')

    // an empty answer
    respond = () => ({ body: '' })
    await expect(
      wfs.fetchWfsLayerFields({
        url: SERVICE,
        version: '2.0.0',
        typeName: TYPE_NAME,
      }),
    ).rejects.toThrow('the schema does not describe the layer')
  })
})

describe('readWfsFieldValues', () => {
  const request = {
    url: SERVICE,
    typeName: TYPE_NAME,
    field: 'status',
    vectorLayerId: '61000000-0000-7000-8000-000000000099',
  }

  it('reads the values of the field with GetPropertyValue', async () => {
    respond = () => ({ body: valueCollection(['1', '3', '1', null]) })
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '2.0.0' }),
    ).toEqual({
      ok: true,
      values: ['1', '3', null],
      complete: true,
    })
    const params = requestedUrls()[0]!.searchParams
    expect(params.get('request')).toBe('GetPropertyValue')
    expect(params.get('typeNames')).toBe(TYPE_NAME)
    expect(params.get('valueReference')).toBe('status')
    expect(params.has('startindex')).toBe(false)
  })

  it('reads on where the previous page ended', async () => {
    // the service caps pages at 3 values
    respond = (url) => ({
      body: valueCollection(
        url.searchParams.has('startindex') ? ['3', '4'] : ['1', '2', '3'],
        'numberMatched="5"',
      ),
    })
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '2.0.0' }),
    ).toEqual({
      ok: true,
      values: ['1', '2', '3', '4'],
      complete: true,
    })
    expect(
      requestedUrls().map((url) => url.searchParams.get('startindex')),
    ).toEqual([null, '3'])
  })

  it('follows the next-page reference of a service reporting unknown counts', async () => {
    respond = (url) => ({
      body: valueCollection(
        url.searchParams.has('startindex') ? ['3'] : ['1', '2'],
        url.searchParams.has('startindex') ?
          'numberMatched="unknown"'
        : 'numberMatched="unknown" next="https://x/2"',
      ),
    })
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '2.0.0' }),
    ).toEqual({ ok: true, values: ['1', '2', '3'], complete: true })
    expect(requestedUrls()).toHaveLength(2)
  })

  it('stops early when the field has too many values', async () => {
    respond = () => ({
      body: valueCollection(numbersUpTo(wfs.WFS_MAX_DISPLAY_VALUES + 1)),
    })
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '2.0.0' }),
    ).toEqual({ ok: false, reason: 'tooManyValues' })
    // the values of the further pages are of no interest
    expect(requestedUrls()).toHaveLength(1)
  })

  it('is incomplete when the service delivered only a part', async () => {
    // truncated by the service
    respond = () => ({
      body: valueCollection(['1'], '', '<wfs:truncatedResponse/>'),
    })
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '2.0.0' }),
    ).toEqual({ ok: true, values: ['1'], complete: false })

    // an empty page before the end
    respond = (url) => ({
      body:
        url.searchParams.has('startindex') ?
          valueCollection([], 'numberMatched="5"')
        : valueCollection(['1'], 'numberMatched="5"'),
    })
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '2.0.0' }),
    ).toEqual({ ok: true, values: ['1'], complete: false })
  })

  it('falls back to the values of the loaded features when the service does not deliver them', async () => {
    // wfs 1.x has no GetPropertyValue
    wfs.rememberWfsFeatureValues(request.vectorLayerId, [
      { type: 'Feature', geometry: null, properties: { status: 1 } },
      { type: 'Feature', geometry: null, properties: { status: 2 } },
    ])
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '1.1.0' }),
    ).toEqual({ ok: true, values: ['1', '2'], complete: false })
    expect(requestedUrls()).toHaveLength(0)

    // wfs 2.0, but the operation is not offered
    respond = () => ({
      body: '<ows:ExceptionReport/>',
      status: 400,
      statusText: 'Bad Request',
    })
    expect(
      await wfs.readWfsFieldValues({ ...request, version: '2.0.0' }),
    ).toEqual({ ok: true, values: ['1', '2'], complete: false })

    // nothing loaded either: the reason is the service's answer
    respond = () => ({
      body: '<ows:ExceptionReport/>',
      status: 400,
      statusText: 'Bad Request',
    })
    expect(
      await wfs.readWfsFieldValues({
        ...request,
        vectorLayerId: '61000000-0000-7000-8000-000000000098',
        version: '2.0.0',
      }),
    ).toEqual({
      ok: false,
      reason: 'unreadable',
      message: 'GetPropertyValue answered 400 Bad Request',
    })
    expect(
      await wfs.readWfsFieldValues({
        ...request,
        vectorLayerId: '61000000-0000-7000-8000-000000000098',
        version: '1.0.0',
      }),
    ).toEqual({
      ok: false,
      reason: 'unreadable',
      message: 'the service speaks wfs 1.0.0, GetPropertyValue needs 2.0',
    })
  })
})

describe('loaded wfs feature values', () => {
  const layerId = '61000000-0000-7000-8000-000000000097'

  it('collects the values per field, null for features without the field', () => {
    wfs.rememberWfsFeatureValues(layerId, [
      { type: 'Feature', geometry: null, properties: { status: 1, note: '' } },
      {
        type: 'Feature',
        geometry: null,
        properties: { status: 'x', note: null },
      },
      { type: 'Feature', geometry: null, properties: {} },
    ])
    expect(wfs.getLoadedWfsFieldValues(layerId, 'status')).toEqual([
      '1',
      'x',
      null,
    ])
    // '' is a value; no value is null — whether the field is null or absent
    expect(wfs.getLoadedWfsFieldValues(layerId, 'note')).toEqual(['', null])

    // a later fetch replaces what was loaded before
    wfs.rememberWfsFeatureValues(layerId, [
      { type: 'Feature', geometry: null, properties: { status: 7 } },
    ])
    expect(wfs.getLoadedWfsFieldValues(layerId, 'status')).toEqual(['7'])
    expect(wfs.getLoadedWfsFieldValues(layerId, 'note')).toEqual([])
  })

  it('refuses fields with too many values among the loaded features too', async () => {
    wfs.rememberWfsFeatureValues(
      layerId,
      numbersUpTo(wfs.WFS_MAX_DISPLAY_VALUES + 1).map((value) => ({
        type: 'Feature' as const,
        geometry: null,
        properties: { other: value },
      })),
    )
    expect(
      await wfs.readWfsFieldValues({
        url: SERVICE,
        version: '1.0.0',
        typeName: TYPE_NAME,
        field: 'other',
        vectorLayerId: layerId,
      }),
    ).toEqual({ ok: false, reason: 'tooManyValues' })
  })
})

describe('displayFromFeature', () => {
  const displays = [
    { display_property_value: null },
    { display_property_value: '1' },
    { display_property_value: '2' },
  ] as unknown as VectorLayerDisplays[]

  it('draws a feature with the display of its value', () => {
    const feature = (value: unknown) => ({
      type: 'Feature',
      geometry: null,
      properties: { status: value },
    })
    expect(displayBy.displayFromFeature(displays, 'status', feature(1))).toBe(
      displays[1],
    )
    expect(displayBy.displayFromFeature(displays, 'status', feature('2'))).toBe(
      displays[2],
    )
    // without a value
    expect(
      displayBy.displayFromFeature(displays, 'status', feature(null)),
    ).toBe(displays[0])
    expect(
      displayBy.displayFromFeature(displays, 'status', feature(undefined)),
    ).toBe(displays[0])
  })

  it('draws features with the first display otherwise', () => {
    // a value no display was created for (it appeared in the data later)
    expect(
      displayBy.displayFromFeature(displays, 'status', {
        type: 'Feature',
        geometry: null,
        properties: { status: 3 },
      }),
    ).toBe(displays[0])
    // displayed by no field
    expect(
      displayBy.displayFromFeature(displays, null, {
        type: 'Feature',
        geometry: null,
        properties: { status: 3 },
      }),
    ).toBe(displays[0])
  })
})

describe('syncWfsLayerDisplays', () => {
  const service = { url: SERVICE, version: '2.0.0' }
  const layerIdOf = (index: number) =>
    `61000000-0000-7000-8000-${String(index).padStart(12, '0')}`
  const argsOf = (index: number) => ({
    vectorLayerId: layerIdOf(index),
    service,
  })
  const insertWfsLayer = async (
    index: number,
    fields: { displayByProperty?: string | null; properties?: string[] } = {},
  ) => {
    const vectorLayerId = layerIdOf(index)
    await db.query(
      `INSERT INTO vector_layers (vector_layer_id, project_id, name, type, wfs_service_layer_name, display_by_property, properties)
       VALUES ($1, $2, $3, 'wfs', $4, $5, $6)`,
      [
        vectorLayerId,
        ids.project,
        `oaks-${index}`,
        TYPE_NAME,
        fields.displayByProperty ?? null,
        fields.properties ? JSON.stringify(fields.properties) : null,
      ],
    )
    return vectorLayerId
  }
  const getLayerRow = async (vectorLayerId: string) =>
    (
      await db.query(`SELECT * FROM vector_layers WHERE vector_layer_id = $1`, [
        vectorLayerId,
      ])
    ).rows[0]!
  const getDisplayValues = async (vectorLayerId: string) =>
    (
      await db.query(
        `SELECT display_property_value FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY display_property_value NULLS FIRST`,
        [vectorLayerId],
      )
    ).rows.map((row) => row.display_property_value)
  let operationsSpy: ReturnType<typeof vi.spyOn>
  const queuedOperations = () =>
    operationsSpy.mock.calls.filter(
      ([atom]) => atom === storeModule.addOperationAtom,
    )

  beforeEach(() => {
    operationsSpy = vi.spyOn(storeModule.store, 'set')
  })
  afterEach(() => {
    operationsSpy.mockRestore()
  })

  it('caches the fields in vector_layers.properties, writing only changes', async () => {
    await insertWfsLayer(1)
    respond = () => ({ body: UNPREFIXED_SCHEMA })
    expect(await sync.cacheWfsLayerFields(argsOf(1))).toEqual(['status'])
    expect((await getLayerRow(layerIdOf(1))).properties).toEqual(['status'])
    expect(queuedOperations()).toHaveLength(1)

    // the same fields again: nothing to sync
    expect(await sync.cacheWfsLayerFields(argsOf(1))).toEqual(['status'])
    expect(queuedOperations()).toHaveLength(1)

    // a new field in the schema
    respond = () => ({ body: MAPSERVER_SCHEMA })
    expect(await sync.cacheWfsLayerFields(argsOf(1))).toEqual([
      'status',
      'nattyp',
      'lmutdat',
      'bemerkungen',
      'geodb_oid',
    ])
    expect((await getLayerRow(layerIdOf(1))).properties).toHaveLength(5)
    expect(queuedOperations()).toHaveLength(2)
  })

  it('leaves the layer untouched when the field has too many values', async () => {
    await insertWfsLayer(2)
    respond = () => ({
      body: valueCollection(numbersUpTo(wfs.WFS_MAX_DISPLAY_VALUES + 1)),
    })
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(2),
        displayByProperty: 'geodb_oid',
      }),
    ).toEqual({ ok: false, reason: 'tooManyValues' })
    expect((await getLayerRow(layerIdOf(2))).display_by_property).toBeNull()
    expect(await getDisplayValues(layerIdOf(2))).toEqual([null])
    expect(queuedOperations()).toHaveLength(0)
  })

  it('displays by the field: one display per value, existing ones unchanged', async () => {
    await insertWfsLayer(3)
    respond = () => ({ body: valueCollection(['1', '3', '1', '2', null]) })
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(3),
        displayByProperty: 'status',
      }),
    ).toEqual({ ok: true, created: 3, removed: 0, complete: true })
    expect((await getLayerRow(layerIdOf(3))).display_by_property).toBe('status')
    // the trigger's display is the one for features without a value
    expect(await getDisplayValues(layerIdOf(3))).toEqual([null, '1', '2', '3'])
    const styled = await db.query(
      `UPDATE vector_layer_displays SET color = '#00ff00' WHERE vector_layer_id = $1 AND display_property_value = '1' RETURNING vector_layer_display_id`,
      [layerIdOf(3)],
    )

    // choosing the same field again creates nothing and changes nothing
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(3),
        displayByProperty: 'status',
      }),
    ).toEqual({ ok: true, created: 0, removed: 0, complete: true })
    expect(await getDisplayValues(layerIdOf(3))).toEqual([null, '1', '2', '3'])
    const kept = await db.query(
      `SELECT color FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
      [styled.rows[0].vector_layer_display_id],
    )
    expect(kept.rows[0].color).toBe('#00ff00')
  })

  it('drops the previous values when choosing another field', async () => {
    await insertWfsLayer(4)
    respond = (url) => ({
      body: valueCollection(
        url.searchParams.get('valueReference') === 'nattyp' ?
          ['0', '1', '2']
        : ['1', '2', '3'],
      ),
    })
    // choosing a field: its values become the displays. The display without a
    // value goes — no feature is without one
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(4),
        displayByProperty: 'status',
      }),
    ).toEqual({ ok: true, created: 3, removed: 1, complete: true })
    expect(await getDisplayValues(layerIdOf(4))).toEqual(['1', '2', '3'])

    // choosing another field drops the values it does not have
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(4),
        displayByProperty: 'nattyp',
      }),
    ).toEqual({ ok: true, created: 1, removed: 1, complete: true })
    expect((await getLayerRow(layerIdOf(4))).display_by_property).toBe('nattyp')
    expect(await getDisplayValues(layerIdOf(4))).toEqual(['0', '1', '2'])
  })

  it('keeps the previous values when the new ones are incomplete', async () => {
    await insertWfsLayer(5)
    respond = (url) => ({
      body:
        url.searchParams.get('valueReference') === 'bemerkungen' ?
          '<ows:ExceptionReport/>'
        : valueCollection(['1', '2', '3']),
      status:
        url.searchParams.get('valueReference') === 'bemerkungen' ? 400 : 200,
    })
    await sync.setWfsDisplayByProperty({
      ...argsOf(5),
      displayByProperty: 'status',
    })
    // the service does not deliver them: those of the loaded features are used
    wfs.rememberWfsFeatureValues(layerIdOf(5), [
      { type: 'Feature', geometry: null, properties: { bemerkungen: 'alt' } },
    ])
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(5),
        displayByProperty: 'bemerkungen',
      }),
    ).toEqual({ ok: true, created: 1, removed: 0, complete: false })
    // deleting on an incomplete list would lose displays of values that exist
    expect(await getDisplayValues(layerIdOf(5))).toEqual(['1', '2', '3', 'alt'])
  })

  it('leaves a single display when the field is cleared', async () => {
    await insertWfsLayer(6)
    respond = () => ({ body: valueCollection(['1', '2']) })
    await sync.setWfsDisplayByProperty({
      ...argsOf(6),
      displayByProperty: 'status',
    })
    expect(await getDisplayValues(layerIdOf(6))).toEqual(['1', '2'])

    // none without a value is left: one is created
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(6),
        displayByProperty: null,
      }),
    ).toEqual({ ok: true, created: 1, removed: 2, complete: true })
    expect((await getLayerRow(layerIdOf(6))).display_by_property).toBeNull()
    expect(await getDisplayValues(layerIdOf(6))).toEqual([null])
  })

  it('never deletes the displays without a value', async () => {
    await insertWfsLayer(9)
    // a second one without a value: clearing ends the styling by value only
    await db.query(
      `INSERT INTO vector_layer_displays (vector_layer_id) VALUES ($1)`,
      [layerIdOf(9)],
    )
    respond = () => ({ body: valueCollection(['1', null]) })
    await sync.setWfsDisplayByProperty({
      ...argsOf(9),
      displayByProperty: 'status',
    })
    expect(await getDisplayValues(layerIdOf(9))).toEqual([null, null, '1'])

    // deleting in favour of a local twin would leave the server without any
    expect(
      await sync.setWfsDisplayByProperty({
        ...argsOf(9),
        displayByProperty: null,
      }),
    ).toEqual({ ok: true, created: 0, removed: 1, complete: true })
    expect(await getDisplayValues(layerIdOf(9))).toEqual([null, null])
  })

  it('reading anew adds new values and removes none', async () => {
    await insertWfsLayer(7)
    respond = serviceAnswering(UNPREFIXED_SCHEMA, ['1', '2'])
    await sync.setWfsDisplayByProperty({
      ...argsOf(7),
      displayByProperty: 'status',
    })

    // the service's data changed: a value appeared
    respond = serviceAnswering(UNPREFIXED_SCHEMA, ['1', '2', '3'])
    expect(await sync.reReadWfsDisplayBy(argsOf(7))).toEqual({
      ok: true,
      created: 1,
      removed: 0,
      complete: true,
    })
    expect(await getDisplayValues(layerIdOf(7))).toEqual(['1', '2', '3'])

    // a value vanished — its display stays: it may have been styled in
    // advance, and it shows in the list
    respond = serviceAnswering(UNPREFIXED_SCHEMA, ['1'])
    expect(await sync.reReadWfsDisplayBy(argsOf(7))).toEqual({
      ok: true,
      created: 0,
      removed: 0,
      complete: true,
    })
    expect(await getDisplayValues(layerIdOf(7))).toEqual(['1', '2', '3'])
  })

  it('re-reads the fields too, and reports what cannot be read', async () => {
    await insertWfsLayer(8, { properties: ['status'] })
    respond = () => ({ body: UNPREFIXED_SCHEMA })
    // no field displayed by: only the fields are read
    expect(await sync.reReadWfsDisplayBy(argsOf(8))).toEqual({
      ok: true,
      created: 0,
      removed: 0,
      complete: true,
    })
    expect((await getLayerRow(layerIdOf(8))).properties).toEqual(['status'])

    // the schema is unreachable
    respond = () => ({ status: 503, statusText: 'Service Unavailable' })
    await expect(sync.reReadWfsDisplayBy(argsOf(8))).rejects.toThrow(
      'DescribeFeatureType answered 503 Service Unavailable',
    )
  })
})
