// https://davidwalsh.name/convert-xml-json
// https://www.xml.com/pub/a/2006/05/31/converting-between-xml-and-json.html
// TODO: why not use https://www.npmjs.com/package/fast-xml-parser?
// or: https://www.npmjs.com/package/xml-js
/**
 * Getting xml
 * Extracting an array of:
 * - layer title
 * - properties
 */
export const xmlToJson = (xml: Node): Record<string, unknown> => {
  // Create the return object
  let obj: Record<string, unknown> = {}

  if (xml.nodeType == 1) {
    // element
    // do attributes
    const attributes = (xml as Element).attributes
    if (attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < attributes.length; j++) {
        const attribute = attributes.item(j)!
        ;(obj['@attributes'] as Record<string, unknown>)[
          attribute.nodeName
        ] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType == 3) {
    // text
    // text nodes never have children, so obj is only read as an object below
    obj = xml.nodeValue as unknown as Record<string, unknown>
  }

  // do children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i)
      const nodeName = item.nodeName
      if (typeof obj[nodeName] == 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof (obj[nodeName] as { push?: unknown }).push == 'undefined') {
          const old = obj[nodeName]
          obj[nodeName] = []
          ;(obj[nodeName] as unknown[]).push(old)
        }
        ;(obj[nodeName] as unknown[]).push(xmlToJson(item))
      }
    }
  }

  return obj
}
