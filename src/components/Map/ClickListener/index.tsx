import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { useMapEvent, useMap } from 'react-leaflet/hooks'
import axios from 'redaxios'

import { useElectric } from '../../../ElectricProvider.tsx'
import { vndOgcGmlToLayersData } from '../../../modules/vndOgcGmlToLayersData.ts'
import { textXmlToLayersData } from '../../../modules/textXmlToLayersData.ts'
import { createNotification } from '../../../modules/createRows.ts'

export const ClickListener = memo(() => {
  const { project_id } = useParams()
  const { user: authUser } = useCorbado()
  const map = useMap()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const onClick = useCallback(
    async (event) => {
      // vector layers are defined on projects
      if (!project_id) return

      const { lat, lng } = event.latlng
      const zoom = map.getZoom()
      const mapSize = map.getSize()
      const bounds = map.getBounds()
      const bbox = `${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`

      const standardParams = {
        service: 'WMS',
        version: '1.3.0',
        request: 'GetFeatureInfo',
        crs: 'EPSG:4326',
        format: 'image/png',
        feature_count: 40,
        x: Math.round(event.containerPoint.x),
        y: Math.round(event.containerPoint.y),
        width: mapSize.x,
        height: mapSize.y,
        bbox,
      }
      // console.log('Map ClickListener, onClick 1', {
      //   lat,
      //   lng,
      //   zoom,
      //   mapSize,
      //   bounds,
      // })

      const layersData = [{ lat, lng, zoom }]

      const filter =
        appState?.filter_vector_layers?.filter(
          (f) => Object.keys(f).length > 0,
        ) ?? []
      const where = filter.length > 1 ? { OR: filter } : filter[0]

      // Three types of querying:
      // 1. Tile Layers
      // 2. Vector Layers from own tables (type !== 'wfs')
      // 3. Vector Layers from WFS with downloaded data
      // 4. Vector Layers from WFS with no downloaded data
      // TODO: filter own layers and layers with downloaded data
      // by querying db.vector_layer_geoms using ST_CONTAINS once postgis arrives in pglite
      const tileLayers = await db.tile_layers.findMany({
        where: { project_id, active: true, ...where },
        orderBy: [{ sort: 'asc' }, { label: 'asc' }],
      })
      // console.log('Map ClickListener, onClick 2', {
      //   vectorLayers: tileLayers,
      //   where,
      // })
      // loop through vector layers and get infos
      for (const layer of tileLayers) {
        const { wms_version, wms_base_url, wms_layer, wms_info_format } = layer

        let res
        let failedToFetch = false
        const params = {
          ...standardParams,
          version: wms_version ?? standardParams.version,
          layers: wms_layer?.value,
          query_layers: wms_layer?.value,
          info_format: wms_info_format?.value ?? 'application/vnd.ogc.gml',
        }
        try {
          res = await axios.get({
            method: 'get',
            url: wms_base_url,
            params,
          })
        } catch (error) {
          console.log({ error, errorToJSON: error?.toJSON?.(), res })
          if (error.status == 406) {
            // user clicked where no feature exists
          } else if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('error.response.data', error.response.data)
            console.error('error.response.status', error.response.status)
            console.error('error.response.headers', error.response.headers)
            failedToFetch = true
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error('error.request:', error.request)
            failedToFetch = true
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('error.message', error.message)
            failedToFetch = true
          }
          if (error.message?.toLowerCase()?.includes('failed to fetch')) {
            failedToFetch = true
          }
          if (failedToFetch) {
            const data = createNotification({
              title: `Fehler beim Laden der Informationen für ${layer.label}`,
              body: error.message,
              intent: 'info',
            })
            db.notifications.create({ data })
          }
        }
        if (!failedToFetch && res?.data) {
          // console.log('Map ClickListener, onClick 3, data:', res?.data)
          switch (wms_info_format?.value) {
            case 'application/vnd.ogc.gml':
            case 'application/vnd.ogc.gml/3.1.1':{
              const parser = new window.DOMParser()
              const dataArray = vndOgcGmlToLayersData(
                parser.parseFromString(res.data, 'text/html'),
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
                parser.parseFromString(res.data, 'text/xml'),
              )
              // do not open empty popups
              if (dataArray.length) {
                dataArray.forEach((data) => {
                  layersData.push(data)
                })
              }
              break
            }
            // TODO: implement these
            case 'text/html': {
              layersData.push({ html: res.data })
              break
            }
            // TODO: test
            case 'application/json':
            case 'text/javascript': {
              // do not open empty popups
              if (!res.data?.length) return
              if (res.data.includes('no results')) return

              layersData.push({ json: res.data })
              break
            }
            case 'text/plain':
            default: {
              // do not open empty popups
              if (!res.data?.length) return
              if (res.data.includes('no results')) return

              layersData.push({ text: res.data })

              // popupContent = ReactDOMServer.renderToString(
              //   <div style={popupContainerStyle}>
              //     <div style={popupContentStyle}>{res.data}</div>
              //   </div>,
              // )
              break
            }
          }
        }
      }
      console.log('Map ClickListener, onClick, layersData:', layersData)
      // TODO: mapInfo needs to deal with html and text data
      // set app_state.map_info to layersData
      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { map_info: layersData },
      })
    },
    [
      appState?.app_state_id,
      appState?.filter_vector_layers,
      db.app_states,
      db.notifications,
      db.tile_layers,
      map,
      project_id,
    ],
  )

  useMapEvent('click', onClick)

  return null
})
