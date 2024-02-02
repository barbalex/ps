// TODO: need to debounce
import axios from 'redaxios'
import { uuidv7 } from '@kripod/uuidv7'

import { Tile_layers as TileLayer } from '../../../../generated/client'
import { xmlToJson } from '../../../../modules/xmlToJson'

export const onTileError = async (db, map, layer: TileLayer, ignore) => {
  console.log('hello onTileError', { ignore, map, layer, db })
  const mapSize = map.getSize()
  const bbox = map.getBounds().toBBoxString()
  const res = await axios({
    method: 'get',
    url: layer.wms_base_url,
    params: {
      service: 'WMS',
      request: 'GetMap',
      version: layer.wms_version,
      layers: layer.wms_layer?.value,
      format: layer.wms_format,
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
  db.notifications.create({
    data: {
      title: `Fehler beim Laden der Bild-Karte '${layer.label}'. Der WMS-Server meldet`,
      body: errorMessage,
      intent: 'error', // 'success' | 'error' | 'warning' | 'info'
      notification_id: uuidv7(),
    },
  })
}

export default onTileError
