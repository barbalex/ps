// TODO: need to debounce
import axios from 'redaxios'

import { TileLayer } from '../../../../dexieClient'
import xmlToJson from '../../../../utils/xmlToJson'
import { IStore } from '../../../../store'

const onTileError = async (store: IStore, map, layer: TileLayer, ignore) => {
  console.log('onTileError', { ignore, map, layer, store })
  const mapSize = map.getSize()
  const bbox = map.getBounds().toBBoxString()
  const res = await axios({
    method: 'get',
    url: layer.wms_base_url,
    params: {
      service: 'WMS',
      request: 'GetMap',
      version: layer.wms_version,
      layers: layer.wms_layers,
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
  store.addNotification({
    title: `Fehler beim Laden der Bild-Karte '${layer.label}'. Der WMS-Server meldet`,
    message: errorMessage,
    type: 'error',
    duration: 20000,
  })
}

export default onTileError
