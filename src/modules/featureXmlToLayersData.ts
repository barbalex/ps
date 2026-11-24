// Reads the features out of the XML that GetFeatureInfo (WMS) and GetFeature (WFS)
// answer with. Every server family lays them out differently, so nothing here depends
// on a namespace prefix:
// - gml:featureMember, gml:featureMembers, wfs:member and ogr:featureMember wrap the
//   feature element (GeoServer, QGIS Server, deegree, OGR, WFS of every version)
// - MapServer groups them: msGMLOutput > <layer>_layer > <layer>_feature
// - QGIS Server: GetFeatureInfoResponse > Layer > Feature > Attribute name value
// - ArcGIS Server: FeatureInfo > Field > FieldName FieldValue, or FIELDS carrying the
//   fields as attributes
// A feature's properties are its child elements with a text and its own attributes.
// Elements with child elements (the geometry, gml:boundedBy) and the gml ones
// (gml:name, gml:description) are left out.

// gml 2 and 3.1 / gml 3.2
const GML_NAMESPACES = [
  'http://www.opengis.net/gml',
  'http://www.opengis.net/gml/3.2',
]
const XSI_NAMESPACE = 'http://www.w3.org/2001/XMLSchema-instance'
const ESRI_NAMESPACE = 'http://www.esri.com/wms'

// wrap the feature element
const WRAPPER_NAMES = ['featuremember', 'featuremembers', 'member']
// are the feature element
const FEATURE_NAMES = ['feature', 'featureinfo', 'fields']
// identify a feature, they are no properties
const ID_ATTRIBUTE_NAMES = ['fid', 'id']

const localName = (element: Element): string => element.localName.toLowerCase()

const childElements = (element: Element): Element[] =>
  Array.from(element.childNodes).filter(
    (node) => node.nodeType === 1,
  ) as Element[]

const textOf = (element: Element | undefined): string =>
  element?.textContent?.trim() ?? ''

const childNamed = (element: Element, name: string): Element | undefined =>
  childElements(element).find((child) => localName(child) === name)

// without a prefix — browsers hand gml:id over as localName 'id', happy-dom as 'gml:id'
const attributeName = (attribute: Attr): string =>
  (attribute.localName || attribute.name).split(':').pop()!

const attributeNameOf = (attribute: Attr): string =>
  attributeName(attribute).toLowerCase()

const attributeValue = (element: Element, name: string): string | undefined =>
  Array.from(element.attributes).find(
    (attribute) => attributeNameOf(attribute) === name,
  )?.value

const isFeatureContainer = (element: Element): boolean =>
  WRAPPER_NAMES.includes(localName(element)) ||
  FEATURE_NAMES.includes(localName(element)) ||
  localName(element).endsWith('_feature')

// the outermost feature containers only: an ArcGIS FeatureInfo holds its FIELDS element
const isOutermostFeatureContainer = (element: Element): boolean => {
  if (!isFeatureContainer(element)) return false
  for (
    let ancestor = element.parentElement;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    if (isFeatureContainer(ancestor)) return false
  }
  return true
}

// a wrapper holds the element carrying the properties, a feature is one itself
const featureElements = (container: Element): Element[] =>
  WRAPPER_NAMES.includes(localName(container)) ?
    childElements(container)
  : [container]

// the properties an element carries as attributes
// arcgis: <FIELDS OBJECTID="1" CONTINENT="Africa" …/>
const attributePropertiesOf = (
  element: Element,
  fields: boolean,
): [string, unknown][] => {
  const properties: [string, unknown][] = []
  for (const attribute of Array.from(element.attributes)) {
    const name = attributeNameOf(attribute)
    if (ID_ATTRIBUTE_NAMES.includes(name)) continue
    if (attribute.namespaceURI === XSI_NAMESPACE) continue
    // FIELDS names the type of the geometry, not a field of the layer
    if (fields && name === 'shape') continue
    properties.push([attributeName(attribute), attribute.value])
  }
  return properties
}

const propertiesOf = (feature: Element): [string, unknown][] => {
  const properties: [string, unknown][] = []
  for (const child of childElements(feature)) {
    const name = localName(child)
    // arcgis: <Field><FieldName>CONTINENT</FieldName><FieldValue>Africa</FieldValue></Field>
    if (name === 'field') {
      const fieldName = textOf(childNamed(child, 'fieldname'))
      // the shape field only holds the geometry
      if (fieldName && fieldName.toLowerCase() !== 'shape') {
        properties.push([fieldName, textOf(childNamed(child, 'fieldvalue'))])
      }
      continue
    }
    // arcgis: <FeatureInfo><FIELDS OBJECTID="1" …/></FeatureInfo>
    if (name === 'fields') {
      properties.push(...attributePropertiesOf(child, true))
      continue
    }
    // gml:name, gml:description, gml:boundedBy
    if (child.namespaceURI && GML_NAMESPACES.includes(child.namespaceURI))
      continue
    // arcgis: the crs of the geometry
    if (name === 'crs' && child.namespaceURI === ESRI_NAMESPACE) continue
    // the geometry and other structured values
    if (childElements(child).length) continue
    const text = textOf(child)
    if (text) {
      properties.push([child.localName, text])
      continue
    }
    // qgis: <Attribute name="Zone" value="2"/> — the wkt geometry comes the same way
    const propertyName = attributeValue(child, 'name')
    if (propertyName) {
      const value = attributeValue(child, 'value')
      if (value !== undefined && propertyName.toLowerCase() !== 'geometry') {
        properties.push([propertyName, value])
      }
      continue
    }
    // e.g. a geometry referenced with xlink:href
    if (child.attributes.length) continue
    properties.push([child.localName, ''])
  }
  properties.push(
    ...attributePropertiesOf(feature, localName(feature) === 'fields'),
  )
  return properties
}

export const featureXmlToLayersData = (
  xml: Document,
): { label?: string; properties: [string, unknown][] }[] =>
  Array.from(xml.getElementsByTagName('*'))
    .filter(isOutermostFeatureContainer)
    .flatMap((container) => {
      // MapServer groups the features of a layer and titles the group with gml:name
      const group = container.parentElement
      const label =
        group && localName(group).endsWith('_layer') ?
          textOf(childNamed(group, 'name'))
        : ''
      return featureElements(container).map((feature) => ({
        ...(label ? { label } : {}),
        properties: propertiesOf(feature),
      }))
    })
