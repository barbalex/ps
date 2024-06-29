import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { useMapEvent, useMap } from 'react-leaflet/hooks'
import proj4 from 'proj4'

import { useElectric } from '../../../ElectricProvider.tsx'
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

      const standardParams = {
        version: '1.3.0',
        request: 'GetFeatureInfo',
        crs: 'EPSG:4326',
        format: 'image/png',
        feature_count: 40,
        x: Math.round(event.containerPoint.x),
        y: Math.round(event.containerPoint.y),
        width: mapSize.x, // TODO: needed?
        height: mapSize.y, // TODO: needed?
      }
      // console.log('Map ClickListener, onClick 1', {
      //   lat,
      //   lng,
      //   zoom,
      //   mapSize,
      //   bounds,
      // })

      const mapInfo = { lat, lng, zoom, layers: [] }
      const tileLayersFilter =
        appState?.filter_tile_layers?.filter(
          (f) => Object.keys(f).length > 0,
        ) ?? []
      const tileLayersWhere =
        tileLayersFilter.length > 1
          ? { OR: tileLayersFilter }
          : tileLayersFilter[0]

      // Three types of querying:
      // 1. Tile Layers
      // 2. Vector Layers from own tables (type !== 'wfs')
      // 3. Vector Layers from WFS with downloaded data
      // 4. Vector Layers from WFS with no downloaded data
      // TODO: filter own layers and layers with downloaded data
      // by querying db.vector_layer_geoms using ST_CONTAINS once PostGIS arrives in PgLite

      // 1. Tile Layers
      const tileLayers = await db.tile_layers.findMany({
        where: { project_id, active: true, ...tileLayersWhere },
        orderBy: [{ sort: 'asc' }, { label: 'asc' }],
      })
      // loop through vector layers and get infos
      for await (const layer of tileLayers) {
        const { wms_version, wms_base_url, wms_layer, wms_info_format } = layer
        const params = {
          ...standardParams,
          service: 'WMS',
          version: wms_version ?? standardParams.version,
          layers: wms_layer?.value,
          query_layers: wms_layer?.value,
          info_format: wms_info_format?.value ?? 'application/vnd.ogc.gml',
          bbox: `${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`,
        }
        const requestData = await fetchData({ db, url: wms_base_url, params })
        if (requestData) {
          layersDataFromRequestData({
            layersData: mapInfo.layers,
            requestData,
            infoFormat: wms_info_format?.value,
          })
        }
      }
      // 4. Vector Layers from WFS with no downloaded data
      const vectorLayersFilter =
        appState?.filter_vector_layers?.filter(
          (f) => Object.keys(f).length > 0,
        ) ?? []
      const vectorLayersWhere =
        vectorLayersFilter.length > 1
          ? { OR: vectorLayersFilter }
          : vectorLayersFilter[0]
      const vectorLayers = await db.vector_layers.findMany({
        where: {
          project_id,
          active: true,
          ...(vectorLayersWhere ? vectorLayersWhere : {}),
        },
        orderBy: [{ sort: 'asc' }, { label: 'asc' }],
      })
      console.log('Map ClickListener.onClick', {
        vectorLayers,
        vectorLayersWhere,
        vectorLayersFilter,
        lat,
        lng,
      })
      // loop through vector layers and get infos
      for await (const layer of vectorLayers) {
        const {
          wfs_version,
          wfs_url,
          wfs_layer,
          wfs_output_format,
          wfs_default_crs,
        } = layer
        // wfs_default_crs is of the form: "urn:ogc:def:crs:EPSG::4326"
        // extract the relevant parts for db.crs.code:
        const wfsDefaultCrsArray = layer.wfs_default_crs?.split(':').slice(-3)
        const wfsDefaultCrsCode = [
          wfsDefaultCrsArray[0],
          wfsDefaultCrsArray[2],
        ].join(':')
        const defaultCrs = await db.crs.findFirst({
          where: { code: wfsDefaultCrsCode },
        })
        const [x, y] = proj4('EPSG:4326', defaultCrs?.proj4, [lng, lat])
        const params = {
          ...standardParams,
          service: 'WFS',
          request: 'GetFeature',
          version: wfs_version ?? standardParams.version,
          layers: wfs_layer?.value,
          typeNames: wfs_layer?.value,
          outputFormat: wfs_output_format?.value ?? 'application/vnd.ogc.gml',
          // TODO: bbox in wfs_default_crs:
          bbox: `${x},${y},${x},${y}`,
          // cql_filter: `INTERSECTS(geom, POINT (${lng} ${lat}))`, // did not work
        }
        const requestData = await fetchData({ db, url: wfs_url, params })
        const label = requestData?.name
        const features = requestData?.features.map((f) => ({
          label,
          properties: f.properties,
        }))

        console.log('Map ClickListener.onClick.vectorLayer', {
          requestData,
          features,
        })
        if (requestData) {
          layersDataFromRequestData({
            layersData: mapInfo.layers,
            requestData: features,
            infoFormat: wfs_output_format?.value,
          })
        }
        // TODO:
      }

      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { map_info: mapInfo },
      })
    },
    [
      appState?.app_state_id,
      appState?.filter_tile_layers,
      appState?.filter_vector_layers,
      db,
      map,
      project_id,
    ],
  )

  useMapEvent('click', onClick)

  return null
})
