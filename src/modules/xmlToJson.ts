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
export const xmlToJson = (xml: Document): object => {
  // Create the return object
  let obj = {}

  if (xml.nodeType == 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j)
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType == 3) {
    // text
    obj = xml.nodeValue
  }

  // do children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i)
      const nodeName = item.nodeName
      if (typeof obj[nodeName] == 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof obj[nodeName].push == 'undefined') {
          const old = obj[nodeName]
          obj[nodeName] = []
          obj[nodeName].push(old)
        }
        obj[nodeName].push(xmlToJson(item))
      }
    }
  }

  return obj
}

