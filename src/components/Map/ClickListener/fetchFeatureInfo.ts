import { fetchData, notifyServiceException } from './fetchData.ts'
import { layersDataFromRequestData } from './layersDataFromRequestData.ts'
import { infoFormatCandidates } from '../../../modules/infoFormats.ts'
import type { LayersDatum } from './layersDataFromRequestData.ts'
import type { HttpGetParams } from '../../../modules/httpGet.ts'

// The format a service last answered with data, by service. Advertised format lists
// are not reliable — a canton's GeoServer lists two gml/3.1.1 formats and answers 500
// to both — so a request falls back through the formats until the server accepts one.
// The one that worked goes first from then on: only the first click pays for the
// probing.
const workingFormats = new Map<string, string>()

// one GetFeatureInfo (WMS) or GetFeature (WFS) request, shaped into drawer entries.
// undefined when there is nothing to show — no feature at the spot, or a failure
// that was reported
export const fetchFeatureInfo = async ({
  url,
  params,
  formatParam,
  serviceKey,
  infoFormat,
  infoFormats,
  fallback,
  layerLabel,
}: {
  url: string
  // the request parameters without the format
  params: HttpGetParams
  // info_format (GetFeatureInfo) or outputFormat (GetFeature)
  formatParam: 'info_format' | 'outputFormat'
  // the service the working format is remembered for
  serviceKey: string
  // the format stored with the service
  infoFormat?: string | null
  // the formats the service advertises
  infoFormats?: readonly unknown[] | null
  // what to ask for when the service advertises nothing
  fallback: (string | undefined)[]
  layerLabel?: string | null
}): Promise<LayersDatum[] | undefined> => {
  const candidates = infoFormatCandidates({
    infoFormat,
    infoFormats,
    fallback,
  })
  const workingFormat = workingFormats.get(serviceKey)
  const formats =
    workingFormat && candidates.includes(workingFormat) ?
      [
        workingFormat,
        ...candidates.filter((format) => format !== workingFormat),
      ]
    : candidates

  // the last failure, reported once no format is left
  let failure: (() => void) | undefined
  for (const format of formats) {
    const result = await fetchData({
      url,
      params:
        format === undefined ? params : { ...params, [formatParam]: format },
      layerLabel,
    })
    if (result.kind === 'none') return undefined
    if (result.kind === 'failed') {
      result.notify()
      return undefined
    }
    if (result.kind === 'rejected') {
      failure = result.notify
      continue
    }
    const { layersData, exception } = layersDataFromRequestData({
      requestData: result.data,
    })
    if (!exception) {
      if (format) workingFormats.set(serviceKey, format)
      return layersData
    }
    failure = () => notifyServiceException(layerLabel, exception.message)
    // the server rejected the format — the next one may work.
    // anything else fails alike for every format
    if (!exception.unsupportedFormat) break
  }
  failure?.()
  return undefined
}
