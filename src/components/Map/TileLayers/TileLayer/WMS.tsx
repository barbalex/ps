import { useMap, WMSTileLayer } from 'react-leaflet'
import { useMapEvent } from 'react-leaflet'
import axios from 'redaxios'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'

import { xmlToLayersData } from '../../../../modules/xmlToLayersData'
import { Popup } from '../../Popup'
import { onTileError } from './onTileError'
import { useElectric } from '../../../../ElectricProvider'
import { css } from '../../../../css'

const popupContentStyle = {
  whiteSpace: 'pre',
}

export const WMS = ({ layer }) => {
  const map = useMap()

  const { db } = useElectric()!

  useMapEvent('click', async (e) => {
    // console.log({ layer })
    if (layer.wms_queryable === false) return
    const mapSize = map.getSize()
    const bounds = map.getBounds()
    let res
    let failedToFetch = false
    try {
      const bbox = `${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
      const params = {
        service: 'WMS',
        version: layer.wms_version,
        request: 'GetFeatureInfo',
        layers: (layer.wms_layers ?? []).map((l) => l.value).join(','),
        crs: 'EPSG:4326',
        format: layer.wms_format,
        info_format: layer.wms_info_format ?? 'application/vnd.ogc.gml',
        // info_format: 'text/plain',
        query_layers: (layer.wms_layers ?? []).map((l) => l.value).join(','),
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        width: mapSize.x,
        height: mapSize.y,
        bbox,
      }
      res = await axios({
        method: 'get',
        url: layer.wms_base_url,
        params,
      })
    } catch (error) {
      // console.log(`error fetching ${row.label}`, error?.toJSON())
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('error.response.data', error.response.data)
        console.error('error.response.status', error.response.status)
        console.error('error.response.headers', error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error('error.request:', error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('error.message', error.message)
      }
      if (error.message?.toLowerCase()?.includes('failed to fetch')) {
        failedToFetch = true
      } else {
        return
      }
    }

    // console.log({ mapSize, y: mapSize.y })
    const popupContainerStyle = css({
      overflow: 'auto',
      maxHeight: mapSize.y - 40,
      maxWidth: mapSize.x - 60,
      span: {
        fontSize: 'x-small !important',
      },
    })

    // build popup depending on wms_info_format
    let popupContent
    // see for values: https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo
    if (failedToFetch) {
      popupContent = ReactDOMServer.renderToString(
        <div style={popupContainerStyle}>
          <div
            style={popupContentStyle}
          >{`Sie könnten offline sein.\n\nOffline können keine WMS-Informationen\nabgerufen werden.`}</div>
        </div>,
      )
    } else {
      switch (layer.wms_info_format) {
        case 'application/vnd.ogc.gml':
        case 'application/vnd.ogc.gml/3.1.1': {
          const parser = new window.DOMParser()
          const layersData = xmlToLayersData(
            parser.parseFromString(res.data, 'text/html'),
          )

          // do not open empty popups
          if (!layersData.length) return

          popupContent = ReactDOMServer.renderToString(
            <Popup layersData={layersData} mapSize={mapSize} />,
          )
          break
        }
        // TODO: test
        case 'text/html': {
          popupContent = (
            <div style={popupContainerStyle}>
              <div dangerouslySetInnerHTML={{ __html: res.data }} />
            </div>
          )
          break
        }
        // TODO: test
        case 'application/json':
        case 'text/javascript': {
          // do not open empty popups
          if (!res.data?.length) return
          if (res.data.includes('no results')) return

          popupContent = ReactDOMServer.renderToString(
            <div style={popupContainerStyle}>
              <div style={popupContentStyle}>{JSON.stringify(res.data)}</div>
            </div>,
          )
          break
        }
        case 'text/plain':
        default: {
          // do not open empty popups
          if (!res.data?.length) return
          if (res.data.includes('no results')) return

          popupContent = ReactDOMServer.renderToString(
            <div style={popupContainerStyle}>
              <div style={popupContentStyle}>{res.data}</div>
            </div>,
          )
          break
        }
      }
    }

    L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map)
  })
  const onTileErrorDebounced = useDebouncedCallback(
    onTileError.bind(this, db, map, layer),
    600,
  )

  // TODO:
  // leaflet calls server internally
  // BUT: if call errors, leaflet does not surface the error
  // instead ALL WMS LAYERS FAIL!!!!!!!!
  return (
    <WMSTileLayer
      url={layer.wms_base_url}
      layers={(layer.wms_layers ?? []).map((l) => l.value).join(',')}
      version={layer.wms_version}
      format={layer.wms_format}
      minZoom={layer.min_zoom}
      maxZoom={layer.max_zoom}
      className={layer.grayscale ? 'grayscale' : ''}
      opacity={layer.opacity}
      transparent={layer.wms_transparent === true}
      // exceptions="inimage"
      eventHandlers={{
        tileerror: onTileErrorDebounced,
      }}
    />
  )
}
