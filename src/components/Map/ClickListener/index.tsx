import { useParams } from '@tanstack/react-router'
import { useMapEvent, useMap } from 'react-leaflet/hooks'
import proj4 from 'proj4'
import { useSetAtom, useAtomValue } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { layersDataFromRequestData } from './layersDataFromRequestData.ts'
import { fetchData } from './fetchData.ts'
import { filterStringFromFilter } from '../../../modules/filterStringFromFilter.ts'
import {
  mapInfoAtom,
  wmsLayersFilterAtom,
  vectorLayersFilterAtom,
} from '../../../store.ts'

export const ClickListener = () => {
  const setMapInfo = useSetAtom(mapInfoAtom)
  const wmsLayersFilter = useAtomValue(wmsLayersFilterAtom)
  const vectorLayersFilter = useAtomValue(vectorLayersFilterAtom)

  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })
  const map = useMap()
  const db = usePGlite()

  const onClick = async (event) => {
    // console.log('ClickListener, click event:', { event, projectId })
    // vector layers are defined on projects
    if (projectId === '99999999-9999-9999-9999-999999999999') return

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
    // TODO: move sort to layer_presentations
    const filterString = filterStringFromFilter(wmsLayersFilter, 'wl')
    const resWmsLayers = await db.query(
      `
        SELECT 
          wl.wms_service_layer_name, 
          ws.info_format, 
          ws.version, 
          ws.url
        FROM wms_layers wl 
          INNER JOIN layer_presentations lp ON lp.wms_layer_id = wl.wms_layer_id
          INNER JOIN wms_services ws ON ws.wms_service_id = wl.wms_service_id
        WHERE 
          lp.active = true 
          AND wl.project_id = $1
          ${filterString} 
        ORDER BY wl.label
      `,
      [projectId],
    )
    const wmsLayers = resWmsLayers?.rows ?? []

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
      const requestData = await fetchData({ url, params })
      if (requestData) {
        layersDataFromRequestData({
          layersData: mapInfo.layers,
          requestData,
          infoFormat: info_format,
        })
      }
    }
    // 4. Vector Layers from WFS with no downloaded data
    const filterStringVl = filterStringFromFilter(vectorLayersFilter, 'vl')
    const resActiveVectorLayers = await db.query(
      `
        SELECT vl.* 
        FROM vector_layers vl
          INNER JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id AND lp.active = true
        WHERE 
          project_id = $1
          ${filterStringVl ? ` AND ${filterStringVl}` : ''} 
        ORDER BY label
      `,
      [projectId],
    )
    const activeVectorLayers = resActiveVectorLayers?.rows ?? []
    // need to buffer for points and polygons or it will be too hard to get their info
    const bufferFraction = 0.00003
    const buffer = bufferFraction + Math.abs(zoom - 19) * bufferFraction * 2
    // loop through vector layers and get infos
    for await (const layer of activeVectorLayers) {
      const res = await db.query(
        `SELECT * FROM wfs_services WHERE wfs_service_id = $1`,
        [layer.wfs_service_id],
      )
      const wfsService = await res?.rows?.[0]
      if (!wfsService) continue
      // default_crs is of the form: "urn:ogc:def:crs:EPSG::4326"
      // extract the relevant parts for db.crs.code:
      const wfsDefaultCrsArray = wfsService.default_crs?.split(':').slice(-3)
      const wfsDefaultCrsCode = [
        wfsDefaultCrsArray[0],
        wfsDefaultCrsArray[2],
      ].join(':')
      const defaultCrsRes = await db.query(
        `SELECT * FROM crs WHERE code = $1`,
        [wfsDefaultCrsCode],
      )
      const defaultCrs = defaultCrsRes?.rows?.[0]
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
      const requestData = await fetchData({ url: wfsService.url, params })
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

    // console.log('ClickListener, mapInfo:', mapInfo)
    setMapInfo(mapInfo)
  }

  useMapEvent('click', onClick)

  return null
}
