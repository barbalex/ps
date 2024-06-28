import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { useMapEvent, useMap } from 'react-leaflet/hooks'
import axios from 'redaxios'

import { useElectric } from '../../../ElectricProvider.tsx'
import { createNotification } from '../../../modules/createRows.ts'
import { layersDataFromRequestData } from './layersDataFromRequestData.ts'
import { fetchData } from './fetchData.ts'

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
      // by querying db.vector_layer_geoms using ST_CONTAINS once PostGIS arrives in PgLite

      // 1. Tile Layers
      const tileLayers = await db.tile_layers.findMany({
        where: { project_id, active: true, ...where },
        orderBy: [{ sort: 'asc' }, { label: 'asc' }],
      })
      // loop through vector layers and get infos
      for await (const layer of tileLayers) {
        const { wms_version, wms_base_url, wms_layer, wms_info_format } = layer
        const params = {
          ...standardParams,
          version: wms_version ?? standardParams.version,
          layers: wms_layer?.value,
          query_layers: wms_layer?.value,
          info_format: wms_info_format?.value ?? 'application/vnd.ogc.gml',
        }
        const requestData = await fetchData({ db, url: wms_base_url, params })
        if (requestData) {
          layersDataFromRequestData({
            layersData,
            requestData,
            infoFormat: wms_info_format?.value,
          })
        }
      }
      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { map_info: layersData },
      })
    },
    [
      appState?.app_state_id,
      appState?.filter_vector_layers,
      db,
      map,
      project_id,
    ],
  )

  useMapEvent('click', onClick)

  return null
})
