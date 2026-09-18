import { vndOgcGmlToLayersData } from '../../../modules/vndOgcGmlToLayersData.ts'
import { textXmlToLayersData } from '../../../modules/textXmlToLayersData.ts'

// runtime shape of the entries collected in mapInfo.layers:
// table layer features, parsed WMS responses and raw text/json/html payloads
export type LayersDatum = {
  label?: unknown
  featureLabel?: string
  properties?: [string, unknown][]
  html?: string
  json?: string
  text?: string
}

export const layersDataFromRequestData = ({
  layersData,
  requestData,
  infoFormat,
}: {
  layersData: LayersDatum[]
  requestData: string | LayersDatum[]
  infoFormat?: string | null
}) => {
  switch (infoFormat) {
    case 'application/vnd.ogc.gml':
    case 'application/vnd.ogc.gml/3.1.1': {
      const parser = new window.DOMParser()
      const dataArray = vndOgcGmlToLayersData(
        parser.parseFromString(requestData as string, 'text/html'),
      )
      // do not open empty popups
      if (dataArray.length) {
        dataArray.forEach((data) => {
          layersData.push(data)
        })
      }
      break
    }
    case 'text/xml': {
      const parser = new window.DOMParser()
      const dataArray = textXmlToLayersData(
        parser.parseFromString(requestData as string, 'text/xml'),
      )
      // do not open empty popups
      if (dataArray.length) {
        dataArray.forEach((data) => {
          layersData.push(data)
        })
      }
      break
    }
    case 'labelPropertiesArray': {
      layersData.push(...(requestData as LayersDatum[]))
      break
    }
    // TODO: implement these
    case 'text/html': {
      layersData.push({ html: requestData as string })
      break
    }
    // TODO: test
    case 'application/json':
    case 'application/json; subtype=geojson':
    case 'text/javascript': {
      // do not open empty popups
      if (!requestData?.length) return
      if ((requestData as string).includes('no results')) return

      layersData.push({ json: requestData as string })
      break
    }
    case 'text/plain':
    default: {
      // do not open empty popups
      if (!requestData?.length) return
      if ((requestData as string).includes('no results')) return

      layersData.push({ text: requestData as string })

      break
    }
  }
}
