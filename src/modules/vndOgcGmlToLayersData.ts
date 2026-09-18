// https://davidwalsh.name/convert-xml-json
// https://www.xml.com/pub/a/2006/05/31/converting-between-xml-and-json.html
/**
 * Getting xml
 * Extracting an array of:
 * - layer title
 * - properties
 */
import { xmlToJson } from './xmlToJson.ts'

export const vndOgcGmlToLayersData = (xml: Document) => {
  const obj = xmlToJson(xml)
  // extract layers
  const html = obj?.HTML as Record<string, unknown> | undefined
  const body = html?.BODY as Record<string, unknown> | undefined
  const output = body?.MSGMLOUTPUT as Record<string, unknown> | undefined
  const layers = Object.entries(output ?? {})
    .filter(([key]) => key.toLowerCase().includes('_layer'))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([, value]) => value)

  const layersData = layers.map((l) => {
    const layer = l as Record<string, unknown>
    const label = (
      layer['GML:NAME'] as Record<string, unknown> | undefined
    )?.['#text']

    const propsObject = Object.entries(layer ?? {})
      .filter(([key]) => key.toLowerCase().includes('_feature'))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([, value]) => value)?.[0] as Record<string, unknown> | undefined

    if (propsObject?.['#text']) delete propsObject!['#text']

    const properties = Object.entries(propsObject as Record<string, unknown>)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([key, _value]) => !key.includes(':'))
      .map(
        ([key, value]) =>
          [key, (value as Record<string, unknown>)?.['#text']] as [
            string,
            unknown,
          ],
      )

    return { label, properties }
  })

  return layersData
}
