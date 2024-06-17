import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { useMapEvent, useMap } from 'react-leaflet/hooks'
import axios from 'redaxios'

import { useElectric } from '../../../ElectricProvider.tsx'

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
        crs: 'EPSG:4326', // TODO:
        format: 'image/png',
        info_format: 'application/vnd.ogc.gml',
        feature_count: 40,
        query_layers: 'flaechen', // linien, punkte
        x: Math.round(event.containerPoint.x),
        y: Math.round(event.containerPoint.y),
        width: mapSize.x,
        height: mapSize.y,
        bbox,
      }
      console.log('Map ClickListener, onClick', {
        lat,
        lng,
        zoom,
        mapSize,
        bounds,
        bbox,
      })

      const layersData = []

      const filter =
        appState?.filter_vector_layers?.filter(
          (f) => Object.keys(f).length > 0,
        ) ?? []
      const where = filter.length > 1 ? { OR: filter } : filter[0]

      // Three types of querying:
      // 1. Vector Layers from own tables (type !== 'wfs')
      // 2. Vector Layers from WFS with pre-downloaded data
      // 3. Vector Layers from WFS with no pre-downloaded data
      // TODO: filter own layers and layers with pre-downloaded data
      // by querying db.vector_layer_geoms using ST_CONTAINS once postgis arrives in pglite
      const vectorLayers = await db.vector_layers.findMany({
        where: { project_id, active: true, type: 'wfs', ...where },
        orderBy: [{ sort: 'asc' }, { label: 'asc' }],
      })
      console.log('Map ClickListener, onClick', { vectorLayers, where })
      // loop through vector layers and get infos
      for (const layer of vectorLayers) {
        const { vector_layer_id, label, wfs_url, wfs_layer } = layer
        const url = `${wfs_url}?service=WFS&version=1.0.0&request=GetFeature&typeName=${wfs_layer}&outputFormat=application/json&cql_filter=INTERSECTS(the_geom, POINT(${lng} ${lat}))`
        console.log('Map ClickListener, onClick', { url })

        let res
        const failedToFetch = false
        const params = {
          ...standardParams,
          version: layer.wfs_version ?? standardParams.version,
          layers: (wfs_layer ?? []).join(','),
          query_layers: (wfs_layer ?? []).join(','),
        }
        try {
          res = await axios.get({
            method: 'get',
            url: layer.wfs_url,
            params,
          })
        } catch (error) {
          console.log({ error, errorToJSON: error?.toJSON?.(), res })
          if (error.status == 406) {
            // user clicked where no massn exists
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
          // TODO:
          // failedToFetch &&
          //   enqueNotification({
          //     message: `Der GIS-Server, der die Massnahmen übermitteln soll, hat einen Fehler gemeldet. Informationen von Massnahmen werden daher nicht angezeigt, auch wenn eine Massnahme geklickt worden sein sollte`,
          //     options: {
          //       variant: 'info',
          //     },
          //   })
        }
        if (!failedToFetch && res?.data) {
          const parser = new window.DOMParser()
          const dataArray = xmlToLayersData(
            parser.parseFromString(res.data, 'text/html'),
          )
          // do not open empty popups
          if (dataArray.length) {
            dataArray.forEach((data) => {
              layersData.push(data)
            })
          }
        }
      }
    },
    [appState?.filter_vector_layers, db.vector_layers, map, project_id],
  )

  useMapEvent('click', onClick)

  return null
})
