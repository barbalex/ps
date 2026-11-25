// "Anzeigen nach" for wfs layers. Own layers take the fields and the values
// of a field from the db — wfs layers from the service: the fields from the
// schema (DescribeFeatureType), the values of one field with GetPropertyValue
// (wfs 2.0). The values are not stored: the service's data changes, so they
// are read anew whenever the displays are synced to them.

import type { Feature } from 'geojson'

import { propertyValueToText } from './displayByProperty.ts'
import { httpGet, type HttpGetParams } from './httpGet.ts'
import { setShortTermOnlineFromFetchError } from './setShortTermOnlineFromFetchError.ts'

// a field with more distinct values than this is not displayed by: one
// display per value would be more than a designer can style
export const WFS_MAX_DISPLAY_VALUES = 30
// GetPropertyValue is read in pages: they bound what a layer with very many
// features takes in memory
const VALUES_PAGE_SIZE = 10_000
const VALUES_MAX_PAGES = 100

// An xml element reduced to what parsing the answers needs. Namespace
// prefixes are dropped: servers declare the same namespaces under different
// ones (xsd:, xs: or none at all)
export type XmlElement = {
  name: string
  local: string
  attrs: Record<string, string>
  children: XmlElement[]
  text: string
}

const ELEMENT_NODE = 1

const toXmlElement = (node: Node): XmlElement | null => {
  if (node.nodeType !== ELEMENT_NODE) return null
  const attrs: Record<string, string> = {}
  for (const attr of Array.from((node as Element).attributes)) {
    attrs[attr.name] = attr.value
  }
  const children: XmlElement[] = []
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = toXmlElement(node.childNodes.item(i)!)
    if (child) children.push(child)
  }
  return {
    name: node.nodeName,
    local: (node as Element).localName || node.nodeName,
    attrs,
    children,
    text: (node as Element).textContent ?? '',
  }
}

// browsers report malformed xml as a <parsererror> document
const isParserError = (element: XmlElement) =>
  element.local === 'parsererror' ||
  element.children.some((child) => child.local === 'parsererror')

// null when the answer is not xml (html error pages, empty answers, malformed xml)
const parseXml = (xml: unknown): XmlElement | null => {
  if (typeof xml !== 'string' || !xml.trim()) return null
  const document = new window.DOMParser().parseFromString(
    xml,
    'application/xml',
  )
  const root =
    document.documentElement ? toXmlElement(document.documentElement) : null
  return root && !isParserError(root) ? root : null
}

const localNameOf = (qualified: string) =>
  qualified.split(':').pop() ?? qualified

const descendants = (element: XmlElement, local: string): XmlElement[] =>
  element.children.flatMap((child) => [
    ...(child.local === local ? [child] : []),
    ...descendants(child, local),
  ])

const isFeatureType = (type: XmlElement) =>
  descendants(type, 'extension').some(
    (extension) =>
      localNameOf(extension.attrs.base ?? '') === 'AbstractFeatureType',
  )

// the element declarations of a type's content model — not those of nested
// types
const propertyElements = (type: XmlElement): XmlElement[] => {
  const elements: XmlElement[] = []
  const walk = (node: XmlElement) => {
    for (const child of node.children) {
      if (child.local === 'complexType') continue
      if (child.local === 'element') elements.push(child)
      walk(child)
    }
  }
  walk(type)
  return elements
}

// gml geometry property types, e.g. gml:MultiSurfacePropertyType (gml 3) or
// gml:GeometryAssociationType (gml 2)
const GEOMETRY_PROPERTY_TYPE =
  /^(?:_?Abstract)?(?:Geometry|Point|Curve|LineString|Surface|Polygon|LinearRing|Multi\w+|Composite\w+|Geometric\w+)(?:PropertyType|AssociationRole|AssociationType)$/

/**
 * The fields of a feature type from its schema (DescribeFeatureType): the
 * element names in schema order, without the geometry and without properties
 * that are no single simple value (nested or repeating ones).
 * null when the schema does not describe the feature type.
 */
export const parseWfsFeatureTypeFields = (
  schema: XmlElement,
  typeName: string,
): string[] | null => {
  const localName = localNameOf(typeName)
  const complexTypes = descendants(schema, 'complexType')
  const declaredType = descendants(schema, 'element').find(
    (element) => element.attrs.name === localName,
  )?.attrs.type
  const featureTypes = complexTypes.filter(isFeatureType)
  const featureType =
    complexTypes.find(
      (type) => type.attrs.name === localNameOf(declaredType ?? ''),
    ) ??
    // no element declaration naming the type: the common <name>Type, or the
    // only feature type of the schema (one type was asked for)
    featureTypes.find((type) => type.attrs.name === `${localName}Type`) ??
    (featureTypes.length === 1 ? featureTypes[0] : undefined)
  if (!featureType) return null

  const fields: string[] = []
  for (const element of propertyElements(featureType)) {
    const { name, type, maxOccurs } = element.attrs
    const typeLocal = localNameOf(type ?? '')
    const isGeometry = GEOMETRY_PROPERTY_TYPE.test(typeLocal)
    // a property with a type of its own is no simple value
    const isNested =
      element.children.some((child) => child.local === 'complexType') ||
      complexTypes.some((complexType) => complexType.attrs.name === typeLocal)
    const isRepeating = maxOccurs !== undefined && maxOccurs !== '1'
    if (
      name &&
      !isGeometry &&
      !isNested &&
      !isRepeating &&
      !fields.includes(name)
    ) {
      fields.push(name)
    }
  }
  return fields
}

/**
 * One GetPropertyValue answer: the distinct values in the order read (null is
 * a feature without a value), how many were read (where the next page starts)
 * and whether more exist.
 */
export const parseWfsPropertyValues = (root: XmlElement) => {
  if (root.local !== 'ValueCollection') {
    throw new Error(`GetPropertyValue answered with <${root.name}>`)
  }
  const members = root.children.filter((child) => child.local === 'member')
  const values: (string | null)[] = []
  for (const member of members) {
    const value = member.children[0]
    // a feature without a value: an empty member or xsi:nil
    const text = !value || value.attrs['xsi:nil'] === 'true' ? null : value.text
    if (!values.includes(text)) values.push(text)
  }
  const matched = Number(root.attrs.numberMatched)
  return {
    values,
    read: members.length,
    // the service stopped before the end
    truncated: root.children.some(
      (child) => child.local === 'truncatedResponse',
    ),
    // null when the service reports the count as "unknown"
    matched:
      root.attrs.numberMatched && Number.isFinite(matched) ? matched : null,
    next:
      !!root.attrs.next ||
      root.children.some((child) => child.local === 'next'),
  }
}

type WfsRequest = { url: string; version: string | null; typeName: string }

const isWfs2 = (version: string | null | undefined) =>
  version?.startsWith('2') ?? false

const getWfs = async (url: string, params: HttpGetParams) => {
  try {
    return await httpGet<string>(url, params)
  } catch (error) {
    // failed on the network level: offline, DNS, CORS-blocked
    setShortTermOnlineFromFetchError(error)
    throw error
  }
}

/**
 * The fields of a wfs layer, read from its schema (DescribeFeatureType).
 */
export const fetchWfsLayerFields = async (
  request: WfsRequest,
): Promise<string[]> => {
  const res = await getWfs(request.url, {
    service: 'WFS',
    ...(request.version ? { version: request.version } : {}),
    request: 'DescribeFeatureType',
    // wfs 2.0 renamed the parameter. 1.x services ignore typeNames — and
    // answer a schema without the layer
    [isWfs2(request.version) ? 'typeNames' : 'typeName']: request.typeName,
  })
  if (!res.ok) {
    throw new Error(
      `DescribeFeatureType answered ${res.status} ${res.statusText}`,
    )
  }
  const schema = parseXml(res.data)
  const fields =
    schema ? parseWfsFeatureTypeFields(schema, request.typeName) : null
  if (!fields) throw new Error('the schema does not describe the layer')
  return fields
}

// The values of the features a layer has loaded, per field — published by the
// layer after every fetch. The fallback for services that do not deliver the
// values of a field: GetPropertyValue is wfs 2.0 only and optional.
const loadedValues = new Map<string, Map<string, Set<string | null>>>()

export const rememberWfsFeatureValues = (
  vectorLayerId: string,
  features: Feature[] | undefined,
) => {
  const values = new Map<string, Set<string | null>>()
  const fields = new Set(
    features?.flatMap((feature) => Object.keys(feature.properties ?? {})),
  )
  for (const field of fields) {
    // a feature without the field has no value (like sql NULL)
    values.set(
      field,
      new Set(
        features?.map((feature) =>
          propertyValueToText(feature.properties?.[field]),
        ),
      ),
    )
  }
  loadedValues.set(vectorLayerId, values)
}

export const getLoadedWfsFieldValues = (
  vectorLayerId: string,
  field: string,
): (string | null)[] => [...(loadedValues.get(vectorLayerId)?.get(field) ?? [])]

const readValuePages = async (request: WfsRequest & { field: string }) => {
  const values: (string | null)[] = []
  let startindex = 0
  for (let page = 0; page < VALUES_MAX_PAGES; page++) {
    const res = await getWfs(request.url, {
      service: 'WFS',
      version: request.version,
      request: 'GetPropertyValue',
      typeNames: request.typeName,
      valueReference: request.field,
      count: VALUES_PAGE_SIZE,
      ...(startindex ? { startindex } : {}),
    })
    if (!res.ok) {
      throw new Error(
        `GetPropertyValue answered ${res.status} ${res.statusText}`,
      )
    }
    const root = parseXml(res.data)
    if (!root) throw new Error('GetPropertyValue answered no xml')
    const parsed = parseWfsPropertyValues(root)
    for (const value of parsed.values) {
      if (!values.includes(value)) values.push(value)
    }
    startindex += parsed.read
    // enough to know the field is not displayed by
    if (values.length > WFS_MAX_DISPLAY_VALUES) return { tooMany: true }
    // a service reporting "unknown" counts tells with a next-page reference
    const exhausted =
      parsed.matched === null ? !parsed.next : startindex >= parsed.matched
    if (parsed.truncated || !parsed.read || exhausted) {
      return {
        values,
        // an empty page before the end: the service delivers no more
        complete: !parsed.truncated && (!!parsed.read || exhausted),
      }
    }
  }
  // not every page was read
  return { values, complete: false }
}

export type WfsFieldValues =
  | { ok: true; values: (string | null)[]; complete: boolean }
  | { ok: false; reason: 'tooManyValues' }
  | { ok: false; reason: 'unreadable'; message: string }

/**
 * The values of a field, to create one display per value. complete when the
 * service delivered them all — services that do not (GetPropertyValue is wfs
 * 2.0 only and optional) leave the values of the features the layer has
 * loaded: a part, but enough to style by.
 */
export const readWfsFieldValues = async ({
  vectorLayerId,
  field,
  ...request
}: WfsRequest & {
  vectorLayerId: string
  field: string
}): Promise<WfsFieldValues> => {
  let unreadable =
    request.version ?
      `the service speaks wfs ${request.version}, GetPropertyValue needs 2.0`
    : 'the service reports no wfs version, GetPropertyValue needs 2.0'
  if (isWfs2(request.version)) {
    try {
      const pages = await readValuePages({ ...request, field })
      return 'tooMany' in pages ?
          { ok: false, reason: 'tooManyValues' }
        : { ok: true, ...pages }
    } catch (error) {
      console.error('readWfsFieldValues: GetPropertyValue failed', error)
      unreadable = error instanceof Error ? error.message : String(error)
    }
  }
  const loaded = getLoadedWfsFieldValues(vectorLayerId, field)
  if (loaded.length > WFS_MAX_DISPLAY_VALUES) {
    return { ok: false, reason: 'tooManyValues' }
  }
  return loaded.length ?
      { ok: true, values: loaded, complete: false }
    : { ok: false, reason: 'unreadable', message: unreadable }
}
