import { featureXmlToLayersData } from '../../../modules/featureXmlToLayersData.ts'
import { ogcException } from '../../../modules/ogcException.ts'
import type { OgcException } from '../../../modules/ogcException.ts'

// runtime shape of the entries collected in mapInfo.layers:
// table layer features, parsed feature responses and raw text/json/html payloads
export type LayersDatum = {
  label?: unknown
  featureLabel?: string
  properties?: [string, unknown][]
  html?: string
  json?: unknown
  text?: string
}

export type LayersDataFromRequestData = {
  layersData: LayersDatum[]
  // the server answered with an exception report instead of features
  exception?: OgcException
}

// the tags a html payload starts with
const HTML_TAG_NAMES = new Set(
  'a article b blockquote body br center code dd div dl dt em font footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input label li link meta nav nobr ol p pre section small span strong style sub sup table tbody td th thead title tr u ul'.split(
    ' ',
  ),
)

const isHtmlTag = (name: string | undefined): boolean =>
  !!name && HTML_TAG_NAMES.has(name.toLowerCase())

// the first tag of a markup payload, after doctype, comments and the xml declaration
const firstTagName = (text: string): string | undefined =>
  text.match(
    /^\s*(?:(?:<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!doctype[^>]*>)\s*)*<\s*([a-z][\w.:-]*)/i,
  )?.[1]

// objects and arrays can not be rendered as text
const asText = (value: unknown): unknown =>
  value !== null && typeof value === 'object' ? JSON.stringify(value) : value

const propertiesOf = (
  feature: Record<string, unknown>,
  // a feature without the GeoJSON wrapper has its properties at the top level
  bare: boolean,
): [string, unknown][] => {
  const properties =
    typeof feature.properties === 'object' && feature.properties !== null ?
      feature.properties
    : bare ? feature
    : {}
  return Object.entries(properties).map(([key, value]) => [key, asText(value)])
}

// a GeoJSON FeatureCollection, or features without the collection around them
const featureObjectsOf = (
  data: unknown,
): Record<string, unknown>[] | undefined => {
  if (Array.isArray(data)) {
    return data.every((entry) => typeof entry === 'object' && entry !== null) ?
        data
      : undefined
  }
  const features = (data as { features?: unknown } | null)?.features
  return Array.isArray(features) ? features : undefined
}

// do not open empty popups
const fromText = (text: string): LayersDataFromRequestData => {
  if (!text.trim() || text.includes('no results')) return { layersData: [] }
  return { layersData: [{ text }] }
}

const fromXml = (text: string, xml: Document): LayersDataFromRequestData => {
  const exception = ogcException(xml)
  if (exception) return { layersData: [], exception }
  // xhtml
  if (isHtmlTag(xml.documentElement?.localName)) {
    return { layersData: [{ html: text }] }
  }
  return { layersData: featureXmlToLayersData(xml) }
}

// Shapes the response of one GetFeatureInfo (WMS) or GetFeature (WFS) request into
// drawer entries — going by what the server sent, not by the format that was asked
// for: servers answer one and the same format with different structures
export const layersDataFromRequestData = ({
  requestData,
}: {
  // httpGet hands json over parsed, everything else as text
  requestData: unknown
}): LayersDataFromRequestData => {
  if (typeof requestData === 'string') {
    if (requestData.trimStart().startsWith('<')) {
      const xml = new window.DOMParser().parseFromString(
        requestData,
        'text/xml',
      )
      if (!xml.getElementsByTagName('parsererror').length) {
        return fromXml(requestData, xml)
      }
    }
    // html is not always well-formed xml
    if (isHtmlTag(firstTagName(requestData))) {
      return { layersData: [{ html: requestData }] }
    }
    return fromText(requestData)
  }
  const features = featureObjectsOf(requestData)
  if (features) {
    return {
      layersData: features.map((feature) => ({
        featureLabel: 'Feature',
        properties: propertiesOf(feature, Array.isArray(requestData)),
      })),
    }
  }
  // json of an unknown shape
  if (requestData && typeof requestData === 'object') {
    return { layersData: [{ json: requestData }] }
  }
  return fromText(String(requestData))
}
