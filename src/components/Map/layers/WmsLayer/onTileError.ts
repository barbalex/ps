// TODO: need to debounce
import type { Map as LeafletMap } from 'leaflet'

import { xmlToJson } from '../../../../modules/xmlToJson.ts'
import { httpGet } from '../../../../modules/httpGet.ts'
import { store, addNotificationAtom } from '../../../../store.ts'

type WmsLayerForTileError = {
  wms_services?: {
    url: string
    version: string | null
    info_format: string | null
  } | null
  wms_service_layer_name?: string | null
  label?: string | null
}

export const onTileError = async (
  map: LeafletMap,
  layer: WmsLayerForTileError,
  ignore: unknown,
) => {
  console.log('hello onTileError', { ignore, map, layer })
  const mapSize = map.getSize()
  const bbox = map.getBounds().toBBoxString()
  const res = await httpGet<string>(layer.wms_services!.url, {
    service: 'WMS',
    request: 'GetMap',
    version: layer.wms_services!.version,
    layers: layer.wms_service_layer_name,
    format: layer.wms_services!.info_format,
    crs: 'EPSG:4326',
    width: mapSize.x,
    height: mapSize.y,
    bbox,
  })
  // console.log(`onTileError res.data:`, res.data)
  const isXML = res.data?.includes('<ServiceException>')
  // console.log(`onTileError isXML:`, isXML)
  if (!isXML) return

  const parser = new window.DOMParser()
  const data = xmlToJson(parser.parseFromString(res.data, 'text/html')) as {
    HTML?: {
      BODY?: {
        SERVICEEXCEPTIONREPORT?: {
          SERVICEEXCEPTION?: { '#text'?: string }
        }
      }
    }
  }
  // console.log(`onTileError data:`, data)
  const errorMessage =
    data?.HTML?.BODY?.SERVICEEXCEPTIONREPORT?.SERVICEEXCEPTION?.['#text']
  // console.log(`onTileError errorMessage:`, errorMessage)
  store.set(addNotificationAtom, {
    title: `Fehler beim Laden der Bild-Karte '${layer.label}'. Der WMS-Server meldet`,
    body: errorMessage,
    intent: 'error',
  })
}

export default onTileError
