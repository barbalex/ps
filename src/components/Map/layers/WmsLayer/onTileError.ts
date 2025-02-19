// TODO: need to debounce
import axios from 'redaxios'

import { xmlToJson } from '../../../../modules/xmlToJson.ts'
import { createNotification } from '../../../../modules/createRows.ts'

export const onTileError = async (db, map, layer, ignore) => {
  console.log('hello onTileError', { ignore, map, layer, db })
  const mapSize = map.getSize()
  const bbox = map.getBounds().toBBoxString()
  const res = await axios({
    method: 'get',
    url: layer.wms_services.url,
    params: {
      service: 'WMS',
      request: 'GetMap',
      version: layer.wms_services.version,
      layers: layer.wms_service_layer_name,
      format: layer.wms_services.info_format,
      crs: 'EPSG:4326',
      width: mapSize.x,
      height: mapSize.y,
      bbox,
    },
  })
  // console.log(`onTileError res.data:`, res.data)
  const isXML = res.data.includes('<ServiceException>')
  // console.log(`onTileError isXML:`, isXML)
  if (!isXML) return

  const parser = new window.DOMParser()
  const data = xmlToJson(parser.parseFromString(res.data, 'text/html'))
  // console.log(`onTileError data:`, data)
  const errorMessage =
    data?.HTML?.BODY?.SERVICEEXCEPTIONREPORT?.SERVICEEXCEPTION?.['#text']
  // console.log(`onTileError errorMessage:`, errorMessage)
  await createNotification({
    title: `Fehler beim Laden der Bild-Karte '${layer.label}'. Der WMS-Server meldet`,
    body: errorMessage,
    intent: 'error',
    db,
  })
}

export default onTileError
