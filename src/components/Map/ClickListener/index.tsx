import { useUrlFilter } from '../../../modules/useUrlFilter.ts'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useMapEvent, useMap } from 'react-leaflet/hooks'
import type {
  Map as LeafletMap,
  LatLng,
  LatLngBounds,
  Layer,
  LeafletMouseEvent,
} from 'leaflet'
import proj4 from 'proj4'
import { useSetAtom, useAtomValue, useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { fetchFeatureInfo } from './fetchFeatureInfo.ts'
import type { LayersDatum } from './layersDataFromRequestData.ts'
import { filterStringFromFilter } from '../../../modules/filterStringFromFilter.ts'
import { getVectorLayerLabel } from '../../../modules/vectorLayerLabel.ts'
import { navigateToOwnForm } from '../../../modules/navigateToOwnForm.ts'
import type { OwnFormTarget } from '../../../modules/navigateToOwnForm.ts'
import { wfsRequestVersion } from '../../../modules/wfsRequestVersion.ts'
import {
  mapInfoAtom,
  languageAtom,
  choosingGeometryAtom,
  editingPlaceGeometryAtom,
  editingCheckGeometryAtom,
  editingActionGeometryAtom,
  addNotificationAtom,
} from '../../../store.ts'
import type { MapInfo } from '../../../store.ts'
import { useUrlPanes } from '../../../modules/useUrlPanes.ts'
import type WfsServices from '../../../models/public/WfsServices.ts'
import type Crs from '../../../models/public/Crs.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'

// set at runtime when an observation is being dragged on the map
type MapWithDragState = LeafletMap & { _isDraggingObservation?: boolean }

// runtime shape of the table layers created for place/check/action features:
// a leaflet Layer extended with custom fields for click detection and labels
type ClickableLayer = Layer & {
  _isInternal?: boolean
  _clickableCircle?: {
    getLatLng?: () => LatLng
    options: { radius?: number }
  }
  feature?: GeoJSON.Feature
  vectorLayerLabel?: string | null
  getBounds?: () => LatLngBounds
  getLatLng?: () => LatLng
}

// rows of the wms_layers/layer_presentations/wms_services join below
type WmsLayerRow = {
  wms_service_layer_name: string | null
  label: string | null
  info_format: string | null
  info_formats: string[] | null
  version: string | null
  url: string
}

// the entries of one response, labelled with the layer they came from
const addLayersData = (
  layersData: LayersDatum[],
  entries: LayersDatum[] | undefined,
  label: string | null | undefined,
) => {
  for (const entry of entries ?? []) {
    layersData.push({ ...entry, label: label || entry.label })
  }
}

// derives the editing/navigation target of a clicked own-table feature —
// without the project, which comes from the route. Observations are
// deliberately absent: their geometry is not user-editable (they are assigned
// to places by dragging)
const ownTargetFromProperties = (
  featureProps: GeoJSON.GeoJsonProperties | undefined,
): Omit<OwnFormTarget, 'projectId'> | undefined => {
  if (featureProps?.check_id) {
    return {
      ownTable: 'check',
      ownId: featureProps.check_id as string,
      ownPlaceId: featureProps.place_id as string | undefined,
    }
  }
  if (featureProps?.action_id) {
    return {
      ownTable: 'action',
      ownId: featureProps.action_id as string,
      ownPlaceId: featureProps.place_id as string | undefined,
    }
  }
  if (featureProps?.place_id) {
    return {
      ownTable: 'place',
      ownId: featureProps.place_id as string,
      ownSubprojectId: featureProps.subproject_id as string | undefined,
      ownParentId: (featureProps.parent_id as string | null) ?? undefined,
    }
  }
  return undefined
}

export const ClickListener = () => {
  const setMapInfo = useSetAtom(mapInfoAtom)
  const [wmsLayersFilter] = useUrlFilter('wmsLayers')
  const [vectorLayersFilter] = useUrlFilter('vectorLayers')
  const language = useAtomValue(languageAtom)
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const [choosingGeometry, setChoosingGeometry] = useAtom(choosingGeometryAtom)
  const setEditingPlaceGeometry = useSetAtom(editingPlaceGeometryAtom)
  const setEditingCheckGeometry = useSetAtom(editingCheckGeometryAtom)
  const setEditingActionGeometry = useSetAtom(editingActionGeometryAtom)
  const [tabs, setTabs] = useUrlPanes()
  const addNotification = useSetAtom(addNotificationAtom)

  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })
  const map = useMap()
  const db = usePGlite()

  const onClick = async (event: LeafletMouseEvent) => {
    // console.log('ClickListener, click event:', { event, projectId })
    // vector layers are defined on projects
    if (projectId === '99999999-9999-9999-9999-999999999999') return

    // Don't process clicks during or immediately after dragging an observation
    if ((map as MapWithDragState)._isDraggingObservation) return

    // Don't process clicks when a geometry is being drawn/edited on the map
    if (map.getContainer().classList.contains('geoman-active')) return

    // Don't process clicks while a measurement is being taken
    if (map.getContainer().classList.contains('measure-active')) return

    const { lat, lng } = event.latlng
    const zoom = map.getZoom()
    const mapSize = map.getSize()
    const bounds = map.getBounds()
    // leaflet keeps the corners in private _southWest/_northEast fields
    const boundsCorners = bounds as unknown as {
      _southWest: LatLng
      _northEast: LatLng
    }

    const mapInfo: MapInfo = { lat, lng, zoom, layers: [] }

    // Check for features from table layers at the click location
    // Leaflet provides clicked layers via event.target
    const clickedLayers: ClickableLayer[] = []
    // Buffer grows exponentially at lower zoom levels to make clicking features easier
    // Base fraction is larger and scales with zoom distance from max zoom
    const bufferFraction = 0.0001
    const zoomDistance = Math.max(0, 19 - zoom)
    // Exponential growth: at zoom 19 = 0.0001, zoom 15 = ~0.0016, zoom 10 = ~0.032
    const buffer = bufferFraction * Math.pow(2, zoomDistance * 0.5)
    const bufferMeters = buffer * 111000

    map.eachLayer(((layer: ClickableLayer) => {
      // Skip internal layers (markers that are part of layer groups)
      if (layer._isInternal) return

      // Handle layer groups with circle markers (from TableLayer)
      if (layer._clickableCircle && layer.feature) {
        const clickableCircle = layer._clickableCircle
        if (clickableCircle.getLatLng) {
          const layerLatLng = clickableCircle.getLatLng()
          const distance = map.distance(event.latlng, layerLatLng)
          // Check if click is within the clickable circle's radius
          const clickRadius = clickableCircle.options.radius || 10
          // Convert radius from pixels to meters approximately
          const radiusMeters = clickRadius * (bufferMeters / 10)
          if (distance <= radiusMeters) {
            clickedLayers.push(layer)
          }
        }
      } else if (layer.feature && layer.getBounds) {
        // Check if the clicked point is within this layer's bounds
        if (layer.getBounds().contains(event.latlng)) {
          clickedLayers.push(layer)
        }
      } else if (layer.feature && layer.getLatLng) {
        // For point features, check if click is close enough
        const layerLatLng = layer.getLatLng()
        const distance = map.distance(event.latlng, layerLatLng)
        if (distance <= bufferMeters) {
          clickedLayers.push(layer)
        }
      }
    }) as unknown as (layer: unknown) => void)

    // Choosing tool active: start editing the first clicked own-table
    // feature instead of collecting feature info. One editing target at a
    // time — the choosing click switches targets, the DrawControl remounts
    // for the new row (its previous edits are persisted on every change).
    if (choosingGeometry) {
      const target = clickedLayers
        .map((layer) => ownTargetFromProperties(layer.feature?.properties))
        .find((target) => !!target)

      if (!target) {
        addNotification({
          intent: 'warning',
          body: formatMessage({
            id: 'mapChooseGeometryNotFound',
            defaultMessage:
              'Keine Geometrie eines Ortes, einer Kontrolle oder einer Massnahme an dieser Stelle',
          }),
        })
        return
      }

      setEditingPlaceGeometry(target.ownTable === 'place' ? target.ownId : null)
      setEditingCheckGeometry(target.ownTable === 'check' ? target.ownId : null)
      setEditingActionGeometry(
        target.ownTable === 'action' ? target.ownId : null,
      )
      setChoosingGeometry(false)
      // the info drawer is not part of the choosing flow
      setMapInfo(null)
      if (!tabs.includes('map')) setTabs([...tabs, 'map'])
      await navigateToOwnForm(db, navigate, { ...target, projectId })
      return
    }

    // Add clicked table layer features to mapInfo
    clickedLayers.forEach((layer) => {
      if (layer.feature && layer.feature.properties) {
        const entries = Object.entries(layer.feature.properties).filter(
          ([key]) =>
            key !== 'geometry' &&
            key !== 'deleted' &&
            key !== 'label' &&
            !key.endsWith('_label'),
        )

        const sortRank = (key: string) => {
          if (key.startsWith('observation_')) return 1
          if (key.startsWith('place_')) return 2
          return 3
        }

        const labelFirstRank = (key: string) => {
          if (key.endsWith('_label')) return 1
          if (key.endsWith('_id')) return 3
          return 2
        }

        const properties = entries
          .sort(([a], [b]) => {
            const groupDiff = sortRank(a) - sortRank(b)
            if (groupDiff !== 0) return groupDiff
            const labelDiff = labelFirstRank(a) - labelFirstRank(b)
            if (labelDiff !== 0) return labelDiff
            return a.localeCompare(b)
          })
          .map(([key, value]): [string, unknown] => {
            if (value instanceof Date) {
              return [key, value.toISOString()]
            }
            return [key, value]
          })

        const featureProps = layer.feature.properties
        let ownTable: 'place' | 'check' | 'action' | undefined
        let ownId: string | undefined
        let ownPlaceId: string | undefined
        let ownSubprojectId: string | undefined
        let ownParentId: string | undefined

        if (featureProps?.check_id) {
          ownTable = 'check'
          ownId = featureProps.check_id
          ownPlaceId = featureProps.place_id
        } else if (featureProps?.action_id) {
          ownTable = 'action'
          ownId = featureProps.action_id
          ownPlaceId = featureProps.place_id
        } else if (featureProps?.place_id) {
          ownTable = 'place'
          ownId = featureProps.place_id
          ownSubprojectId = featureProps.subproject_id
          ownParentId = featureProps.parent_id ?? undefined
        }

        mapInfo.layers.push({
          label: layer.vectorLayerLabel || 'Unknown Layer',
          featureLabel: featureProps?.label || 'Feature',
          properties,
          ...(ownTable ?
            {
              ownTable,
              ownId,
              ownPlaceId,
              ownSubprojectId,
              ownParentId,
              projectId,
            }
          : {}),
        })
      }
    })

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
          wl.label,
          ws.info_format, 
          ws.info_formats,
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
    const wmsLayers = (resWmsLayers?.rows ?? []) as WmsLayerRow[]

    // loop through wms layers and get infos
    for (const layer of wmsLayers) {
      const {
        version,
        url,
        wms_service_layer_name,
        info_format,
        info_formats,
        label: wmsLayerLabel,
      } = layer
      const layersData = await fetchFeatureInfo({
        url,
        params: {
          request: 'GetFeatureInfo',
          service: 'WMS',
          version: version ?? '1.3.0',
          crs: 'EPSG:4326',
          layers: wms_service_layer_name,
          query_layers: wms_service_layer_name,
          x: Math.round(event.containerPoint.x),
          y: Math.round(event.containerPoint.y),
          width: mapSize.x,
          height: mapSize.y,
          bbox: `${boundsCorners._southWest.lat},${boundsCorners._southWest.lng},${boundsCorners._northEast.lat},${boundsCorners._northEast.lng}`,
        },
        formatParam: 'info_format',
        serviceKey: `wms:${url}`,
        infoFormat: info_format,
        infoFormats: info_formats,
        // what to ask for when the capabilities list none
        fallback: ['application/json', 'application/vnd.ogc.gml', 'text/plain'],
        layerLabel: wmsLayerLabel,
      })
      addLayersData(mapInfo.layers, layersData, wmsLayerLabel)
    }
    // 4. Vector Layers from WFS with no downloaded data
    const filterStringVl = filterStringFromFilter(vectorLayersFilter, 'vl')
    const resActiveVectorLayers = await db.query(
      `
        SELECT vl.*
        FROM vector_layers vl
          INNER JOIN layer_presentations lp ON lp.vector_layer_id = vl.vector_layer_id AND lp.active = true
        WHERE
          vl.project_id = $1
          AND vl.wfs_service_id IS NOT NULL
          ${filterStringVl ? ` AND ${filterStringVl}` : ''}
        ORDER BY vl.name
      `,
      [projectId],
    )
    const activeVectorLayers = (resActiveVectorLayers?.rows ??
      []) as VectorLayers[]
    // need to buffer for points and polygons or it will be too hard to get their info
    // (buffer already calculated above for click detection)

    // loop through vector layers and get infos
    for (const layer of activeVectorLayers) {
      const res = await db.query(
        `SELECT * FROM wfs_services WHERE wfs_service_id = $1`,
        [layer.wfs_service_id],
      )
      const wfsService = await (res?.rows?.[0] as WfsServices | undefined)
      if (!wfsService) continue
      // default_crs is of the form: "urn:ogc:def:crs:EPSG::4326"
      // extract the relevant parts for db.crs.code:
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
      // a crs unknown to the crs table leaves the coordinates in 4326
      const toDefaultCrs = (coordinates: [number, number]): [number, number] =>
        defaultCrs?.proj4 ?
          proj4('EPSG:4326', defaultCrs.proj4, coordinates)
        : coordinates
      const [x, y] = toDefaultCrs([lng - buffer, lat - buffer])
      const [x2, y2] = toDefaultCrs([lng + buffer, lat + buffer])
      const layerLabel = getVectorLayerLabel(layer, language, undefined)
      const layersData = await fetchFeatureInfo({
        url: wfsService.url!,
        params: {
          service: 'WFS',
          request: 'GetFeature',
          version: wfsRequestVersion(wfsService.version),
          layers: layer.wfs_service_layer_name,
          typeNames: layer.wfs_service_layer_name,
          // bbox needs to be in default_crs:
          bbox: `${x},${y},${x2},${y2}`,
          // cql_filter: `INTERSECTS(geom, POINT (${lng} ${lat}))`, // did not work
        },
        formatParam: 'outputFormat',
        serviceKey: `wfs:${wfsService.url}`,
        infoFormat: wfsService.info_format,
        infoFormats: wfsService.info_formats as string[] | null,
        // no format asked for: the server answers with its default gml
        fallback: [undefined],
        layerLabel,
      })
      addLayersData(mapInfo.layers, layersData, layerLabel)
    }

    // console.log('ClickListener, mapInfo:', mapInfo)
    setMapInfo(mapInfo)
  }

  useMapEvent('click', onClick)

  return null
}
