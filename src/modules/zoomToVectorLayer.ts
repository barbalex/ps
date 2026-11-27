import reproject from 'reproject'
import type { Feature, FeatureCollection } from 'geojson'
import { bbox } from '@turf/bbox'
import { featureCollection } from '@turf/helpers'
import type * as L from 'leaflet'

import {
  extentSelect,
  queryExtent,
  extentFromBbox,
  extentToBoundsWithMargin,
  type Extent,
  type QueryableDb,
} from './geoQueries.ts'
import { httpGet } from './httpGet.ts'
import { wfsRequestVersion } from './wfsRequestVersion.ts'
import type VectorLayers from '../models/public/VectorLayers.ts'
import type WfsServices from '../models/public/WfsServices.ts'
import type Crs from '../models/public/Crs.ts'

type Props = {
  db: QueryableDb
  // vector_layers row — works for active and own-section layers alike
  layer: VectorLayers
  // Absent in project overview, including while a feature's form is open.
  subprojectId?: string
  filterSql?: string
  areaFilter?: (alias: string) => string
  addNotification: (notification: {
    title: string
    intent: 'info'
  }) => unknown
  setMapBounds: (bounds: L.LatLngBoundsExpression) => void
}

/**
 * Zooms the map to the extent of a layer's geometries: own-table layers
 * (places, actions, checks, observations) via PostGIS in the local db,
 * wfs layers via their cached geometries or a live GetFeature request,
 * uploaded layers via vector_layer_geoms. Shared by the layer drawer's
 * active-section rows and own-section rows.
 */
export const zoomToVectorLayer = async ({
  db,
  layer,
  subprojectId,
  filterSql,
  areaFilter = () => '',
  addNotification,
  setMapBounds,
}: Props): Promise<void> => {
  // Get the extent of all geometries of this layer via PostGIS
  let extent: Extent | null

  {
    const scopeSql = subprojectId ? 'AND s.subproject_id = $2' : filterSql ?
      `AND s.subproject_id IN (SELECT subproject_id FROM subprojects WHERE (${filterSql}))` : ''
    const scopeParams = subprojectId ? [layer.project_id, subprojectId] : [layer.project_id]
    const tableName =
      layer.type === 'upload' || layer.type === 'wfs' ? null
      : layer.own_table_level ?
        `${layer.own_table}${layer.own_table_level}`
      : layer.own_table

    if (tableName?.startsWith('places')) {
      const level = layer.own_table_level
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect('p')} FROM places p
         INNER JOIN subprojects s ON p.subproject_id = s.subproject_id
         WHERE s.project_id = $1
         AND p.geometry IS NOT NULL${areaFilter('p')}
         ${scopeSql}
         ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
        scopeParams,
      )
    } else if (tableName?.startsWith('actions')) {
      const level = layer.own_table_level
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect('a')} FROM actions a
         INNER JOIN places p ON a.place_id = p.place_id
         INNER JOIN subprojects s ON p.subproject_id = s.subproject_id
         WHERE s.project_id = $1
         AND a.geometry IS NOT NULL${areaFilter('a')}
         ${scopeSql}
         ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
        scopeParams,
      )
    } else if (tableName?.startsWith('checks')) {
      const level = layer.own_table_level
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect('c')} FROM checks c
         INNER JOIN places p ON c.place_id = p.place_id
         INNER JOIN subprojects s ON p.subproject_id = s.subproject_id
         WHERE s.project_id = $1
         AND c.geometry IS NOT NULL${areaFilter('c')}
         ${scopeSql}
         ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
        scopeParams,
      )
    } else if (tableName?.startsWith('observations_assigned')) {
      const level = layer.own_table_level
      const lines = layer.own_table === 'observations_assigned_lines'
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect()} FROM (
         SELECT ${lines ? 'ST_Collect(ST_Centroid(ST_Envelope(o.geometry)), ST_Centroid(ST_Envelope(p.geometry)))' : 'o.geometry'} AS geometry
         FROM observations o
         INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
         INNER JOIN places p ON o.place_id = p.place_id
         INNER JOIN subprojects s ON oi.subproject_id = s.subproject_id
         WHERE s.project_id = $1
         AND o.geometry IS NOT NULL${areaFilter('o')}
         ${lines ? 'AND p.geometry IS NOT NULL' : ''}
         ${scopeSql}
         ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}) scoped`,
        scopeParams,
      )
    } else if (tableName === 'observations_to_assess') {
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect('o')} FROM observations o
         INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
         INNER JOIN subprojects s ON oi.subproject_id = s.subproject_id
         WHERE s.project_id = $1
         AND o.place_id IS NULL
         AND (o.not_to_assign IS NULL OR o.not_to_assign = FALSE)
         AND o.geometry IS NOT NULL${areaFilter('o')}
         ${scopeSql}`,
        scopeParams,
      )
    } else if (tableName === 'observations_not_to_assign') {
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect('o')} FROM observations o
         INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
         INNER JOIN subprojects s ON oi.subproject_id = s.subproject_id
         WHERE s.project_id = $1
         AND o.place_id IS NULL
         AND o.not_to_assign = true
         AND o.geometry IS NOT NULL${areaFilter('o')}
         ${scopeSql}`,
        scopeParams,
      )
    } else if (layer.type === 'wfs') {
      // For WFS layers, get from vector_layer_geoms
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect()} FROM vector_layer_geoms WHERE vector_layer_id = $1`,
        [layer.vector_layer_id],
      )

      if (!extent) {
        const wfsRes = await db.query(
          `SELECT * FROM wfs_services WHERE wfs_service_id = $1`,
          [layer.wfs_service_id],
        )
        const wfsService = wfsRes?.rows?.[0] as WfsServices | undefined
        if (!wfsService?.url || !layer.wfs_service_layer_name) {
          return void addNotification({
            title: 'No geometries found for this layer',
            intent: 'info',
          })
        }

        const wfsDefaultCrsArray = wfsService.default_crs?.split(':').slice(-3)
        const wfsDefaultCrsCode =
          wfsDefaultCrsArray?.length === 3 ?
            [wfsDefaultCrsArray[0], wfsDefaultCrsArray[2]].join(':')
          : 'EPSG:4326'
        const defaultCrsRes = await db.query(
          `SELECT * FROM crs WHERE code = $1`,
          [wfsDefaultCrsCode],
        )
        const defaultCrs = defaultCrsRes?.rows?.[0] as Crs | undefined

        // no viewport bbox: the point of zooming is to travel to the data,
        // so the request must not be scoped to where the user happens to
        // be — max_features still bounds the response
        let response
        try {
          response = await httpGet(wfsService.url, {
            service: 'WFS',
            request: 'GetFeature',
            version: wfsRequestVersion(wfsService.version),
            typeNames: layer.wfs_service_layer_name,
            outputFormat: wfsService.info_format ?? 'application/json',
            srsName: wfsDefaultCrsCode,
            maxfeatures: layer.max_features ?? 1000,
          })
        } catch (error) {
          console.error('Zoom to WFS layer failed', error)
          return void addNotification({
            title: 'No geometries found for this layer',
            intent: 'info',
          })
        }
        if (!response.ok) {
          console.error(
            'Zoom to WFS layer failed:',
            response.status,
            response.statusText,
            response.data,
          )
          return void addNotification({
            title: 'No geometries found for this layer',
            intent: 'info',
          })
        }

        const data = response.data as { features?: Feature[] } | undefined
        const rawFeatures = data?.features ?? []
        if (!rawFeatures.length) {
          return void addNotification({
            title: 'No geometries found for this layer',
            intent: 'info',
          })
        }

        let fc: FeatureCollection = featureCollection(rawFeatures)
        if (defaultCrs?.proj4 && wfsDefaultCrsCode !== 'EPSG:4326') {
          fc = reproject.reproject(
            fc,
            defaultCrs.proj4,
            '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
          ) as FeatureCollection
        }
        extent = extentFromBbox(bbox(fc))
      }
    } else {
      // For uploaded vector layers
      extent = await queryExtent(
        db,
        `SELECT ${extentSelect()} FROM vector_layer_geoms WHERE vector_layer_id = $1`,
        [layer.vector_layer_id],
      )
    }
  }

  if (!extent) {
    return void addNotification({
      title: 'No geometries found for this layer',
      intent: 'info',
    })
  }

  setMapBounds(extentToBoundsWithMargin(extent))
}
