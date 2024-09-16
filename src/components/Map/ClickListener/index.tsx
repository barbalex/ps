import { memo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useMapEvent, useMap } from 'react-leaflet/hooks'
import proj4 from 'proj4'
import { useSetAtom, useAtom } from 'jotai'

import { useElectric } from '../../../ElectricProvider.tsx'
import { layersDataFromRequestData } from './layersDataFromRequestData.ts'
import { fetchData } from './fetchData.ts'
import { sqlFromFilter } from '../../../modules/sqlFromFilter.ts'
import {
  mapInfoAtom,
  wmsLayersFilterAtom,
  vectorLayersFilterAtom,
} from '../../../store.ts'

export const ClickListener = memo(() => {
  const setMapInfo = useSetAtom(mapInfoAtom)
  const [wmsLayersFilter] = useAtom(wmsLayersFilterAtom)
  const [vectorLayersFilter] = useAtom(vectorLayersFilterAtom)

  const { project_id } = useParams()
  const map = useMap()
  const { db } = useElectric()!

  const onClick = useCallback(
    async (event) => {
      // vector layers are defined on projects
      if (!project_id) return

      const { lat, lng } = event.latlng
      const zoom = map.getZoom()
      const mapSize = map.getSize()
      const bounds = map.getBounds()

      const mapInfo = { lat, lng, zoom, layers: [] }

      // Three types of querying:
      // 1. WMS Layers
      // 2. Vector Layers from own tables (type !== 'wfs')
      // 3. Vector Layers from WFS with downloaded data
      // 4. Vector Layers from WFS with no downloaded data
      // TODO: filter own layers and layers with downloaded data
      // by querying db.vector_layer_geoms using ST_CONTAINS once PostGIS arrives in PgLite

      // 1. WMS Layers
      // using raw query because of the join with layer_presentations
      // TODO: move sort to layer_presentations
      const sqlFilter = sqlFromFilter({
        filter: wmsLayersFilter,
        columnPrefix: 'wl.',
      })
      const sqlToAddToWhere = sqlFilter ? ` AND ${sqlFilter}` : ''
      const wmsLayers = await db.rawQuery({
        sql: `select wl.wms_service_layer_name, ws.info_format, ws.version, ws.url
                from wms_layers wl 
                inner join layer_presentations lp on lp.wms_layer_id = wl.wms_layer_id
                inner join wms_services ws on ws.wms_service_id = wl.wms_service_id
                where lp.active = true and wl.project_id = $1${sqlToAddToWhere} order by wl.label`,
        args: [project_id],
      })
      // loop through vector layers and get infos
      for await (const layer of wmsLayers) {
        const { version, url, wms_service_layer_name, info_format } = layer
        // in raw queries, jsonb columns need to be parsed
        const params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          version: version ?? '1.3.0',
          crs: 'EPSG:4326',
          layers: wms_service_layer_name,
          query_layers: wms_service_layer_name,
          info_format: info_format ?? 'application/vnd.ogc.gml',
          x: Math.round(event.containerPoint.x),
          y: Math.round(event.containerPoint.y),
          width: mapSize.x,
          height: mapSize.y,
          bbox: `${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`,
        }
        const requestData = await fetchData({ db, url, params })
        if (requestData) {
          layersDataFromRequestData({
            layersData: mapInfo.layers,
            requestData,
            infoFormat: info_format,
          })
        }
      }
      // 4. Vector Layers from WFS with no downloaded data
      const vectorLayersWhere =
        vectorLayersFilter.length > 1
          ? { OR: vectorLayersFilter }
          : vectorLayersFilter[0]
      const vectorLayers = await db.vector_layers.findMany({
        where: {
          project_id,
          ...(vectorLayersWhere ? vectorLayersWhere : {}),
        },
        include: {
          wfs_services: { include: { wfs_service_layers: true } },
          layer_presentations: true,
        },
        orderBy: { label: 'asc' },
      })
      const activeVectorLayers = vectorLayers.filter(
        (l) => l.layer_presentations?.[0]?.active,
      )
      // need to buffer for points and polygons or it will be too hard to get their info
      const bufferFraction = 0.00003
      const buffer = bufferFraction + Math.abs(zoom - 19) * bufferFraction * 2
      // loop through vector layers and get infos
      for await (const layer of activeVectorLayers) {
        const wfsService = layer.wfs_services
        if (!wfsService) continue
        // default_crs is of the form: "urn:ogc:def:crs:EPSG::4326"
        // extract the relevant parts for db.crs.code:
        const wfsDefaultCrsArray = wfsService.default_crs?.split(':').slice(-3)
        const wfsDefaultCrsCode = [
          wfsDefaultCrsArray[0],
          wfsDefaultCrsArray[2],
        ].join(':')
        const defaultCrs = await db.crs.findFirst({
          where: { code: wfsDefaultCrsCode },
        })
        const [x, y] = proj4('EPSG:4326', defaultCrs?.proj4, [
          lng - buffer,
          lat - buffer,
        ])
        const [x2, y2] = proj4('EPSG:4326', defaultCrs?.proj4, [
          lng + buffer,
          lat + buffer,
        ])
        const params = {
          service: 'WFS',
          request: 'GetFeature',
          version: wfsService.version ?? '1.3.0',
          layers: layer.wfs_service_layer_name,
          typeNames: layer.wfs_service_layer_name,
          outputFormat: wfsService.info_format ?? 'application/vnd.ogc.gml',
          // bbox needs to be in default_crs:
          bbox: `${x},${y},${x2},${y2}`,
          // cql_filter: `INTERSECTS(geom, POINT (${lng} ${lat}))`, // did not work
        }
        const requestData = await fetchData({ db, url: wfsService.url, params })
        const label = requestData?.name
        const features = requestData?.features.map((f) => ({
          label,
          properties: Object.entries(f.properties ?? {}),
        }))
        if (requestData) {
          layersDataFromRequestData({
            layersData: mapInfo.layers,
            requestData: features,
            infoFormat: 'labelPropertiesArray',
          })
        }
      }

      setMapInfo(mapInfo)
    },
    [project_id, map, wmsLayersFilter, db, vectorLayersFilter, setMapInfo],
  )

  useMapEvent('click', onClick)

  return null
})
