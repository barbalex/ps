import { useEffect, useState, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useMapEvent, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import type { GeoJSON } from 'geojson'

import { ProgressiveGeoJSON } from '../ProgressiveGeoJSON.tsx'
import { cachedMarkerIconHtml } from '../markerIconHtml.tsx'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { Popup } from '../../Popup.tsx'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'
import {
  addNotificationAtom,
  removeNotificationAtom,
} from '../../../../store.ts'
import styles from './PVLGeom.module.css'
import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import type VectorLayers from '../../../../models/public/VectorLayers.ts'

// const bboxBuffer = 0.01

// Shape of the vector layer as historically passed here: a vector_layers row
// joined with its layer_presentations (and short-lived convenience fields)
type PVLGeomLayer = Partial<VectorLayers> & {
  id?: string
  label: string | null
  active?: boolean | null
  layer_presentations?: LayerPresentations[] | null
}

type PVLGeomDisplay = {
  marker_type?: string | null
  marker_symbol?: string | null
  marker_size?: number | null
  color?: string | null
  circle_marker_radius?: number | null
  opacity_percent?: number | null
}

type Props = {
  layer: PVLGeomLayer
  display?: PVLGeomDisplay | null
}

// LatLngBounds with the internal corner properties read by the query below
type LatLngBoundsWithInternals = L.LatLngBounds & {
  _southWest: L.LatLng
  _northEast: L.LatLng
}

type VectorLayerGeomRow = {
  vector_layer_geom_id: string
  geometry: GeoJSON
  properties: unknown
  updated_at: string
}

export const PVLGeom = ({ layer, display }: Props) => {
  const db = usePGlite()
  const layerPresentation = (layer.layer_presentations ??
    [])[0] as LayerPresentations
  const addNotification = useSetAtom(addNotificationAtom)
  const removeNotification = useSetAtom(removeNotificationAtom)

  const [data, setData] = useState<GeoJSON[]>()

  // row ids of the last fetch, per layer: a zoomend refetch often returns
  // the same rows (zooming in only tightens the bounds) — a new data
  // array would clear and progressively rebuild the rendered layer
  // (the overlays blinking out), so equal row sets keep the old identity
  const lastFetchRef = useRef<{
    layerId: string | null
    ids: string[]
  } | null>(null)

  const notificationIds = useRef<string[]>([])

  const removeNotifs = useCallback(async () => {
    for (const notificationId of notificationIds.current) {
      removeNotification(notificationId)
    }
    notificationIds.current = []
  }, [removeNotification])

  const map = useMap()

  const [zoom, setZoom] = useState<number>(map.getZoom())

  // stable identity per feature (id + updated_at): lets
  // ProgressiveGeoJSON reconcile refetched data without rebuilding.
  // leaflet wraps the geometry objects we feed it into features, lifting
  // only `properties` — the identity fields stay on the wrapped geometry
  const featureKey = useCallback(
    (feature: GeoJSON.Feature) => {
      const geometry = feature.geometry as {
        vectorLayerGeomId?: string
        vectorLayerGeomUpdatedAt?: string
      } | null
      return geometry ?
          `${geometry.vectorLayerGeomId}@${geometry.vectorLayerGeomUpdatedAt}`
        : undefined
    },
    [],
  )

  const fetchData = useCallback(
    async ({ bounds }: { bounds: LatLngBoundsWithInternals }) => {
      removeNotifs()
      const notificationId = addNotification({
        title: `Lade Vektor-Karte '${layer.label}'...`,
        intent: 'info',
      })
      notificationIds.current = [
        notificationId as string,
        ...notificationIds.current,
      ]

      const resVectorLayerGeoms = await db.query(
        `
        SELECT
          vector_layer_geom_id,
          geometry,
          properties,
          updated_at
        FROM vector_layer_geoms
        WHERE
          vector_layer_id = $1
          AND bbox_sw_lng > $2
          AND bbox_sw_lat > $3
          AND bbox_ne_lng < $4
          AND bbox_ne_lat < $5
        LIMIT $6
      `,
        [
          layer.vector_layer_id,
          bounds._southWest.lng,
          bounds._southWest.lat,
          bounds._northEast.lng,
          bounds._northEast.lat,
          layer.max_features ?? 1000,
        ],
      )
      const vectorLayerGeoms = (resVectorLayerGeoms?.rows ??
        []) as VectorLayerGeomRow[]

      const data = vectorLayerGeoms.map((pvlGeom) => ({
        ...pvlGeom.geometry,
        properties: pvlGeom.properties,
        // identity for ProgressiveGeoJSON's reconciliation: id + updated_at
        // so edited geometries count as new while unchanged ones stay
        // rendered across the zoomend refetches
        vectorLayerGeomId: pvlGeom.vector_layer_geom_id,
        vectorLayerGeomUpdatedAt: pvlGeom.updated_at,
      })) as GeoJSON[]
      removeNotifs()

      const geomIds = vectorLayerGeoms
        .map((row) => row.vector_layer_geom_id)
        .sort()
      const lastFetch = lastFetchRef.current
      lastFetchRef.current = {
        layerId: layer.vector_layer_id ?? null,
        ids: geomIds,
      }
      const sameRowsAsLastFetch =
        lastFetch?.layerId === (layer.vector_layer_id ?? null) &&
        lastFetch.ids.length === geomIds.length &&
        lastFetch.ids.every((id, i) => id === geomIds[i])
      if (!sameRowsAsLastFetch) {
        setData(data)
      }
      setZoom(map.getZoom())
    },
    [
      removeNotifs,
      addNotification,
      layer.label,
      layer.vector_layer_id,
      layer.max_features,
      db,
      map,
    ],
  )
  const fetchDataDebounced = useDebouncedCallback(fetchData, 600)

  useMapEvent('dragend zoomend' as 'zoomend', () => {
    fetchDataDebounced({ bounds: map.getBounds() as LatLngBoundsWithInternals })
  })

  useEffect(() => {
    fetchDataDebounced({ bounds: map.getBounds() as LatLngBoundsWithInternals })
  }, [fetchDataDebounced, map])

  // notif cleanup after commit — writing atoms during render is a side
  // effect (and re-ran on every render)
  useEffect(() => {
    removeNotifs()
  }, [removeNotifs, data])

  useEffect(() => {
    // goal: remove own notifs when (de-)activating layer
    removeNotifs()
  }, [layer.active, removeNotifs])
  useEffect(() => {
    return () => {
      // goal: remove notifs on leaving component. Does not seem to work
      removeNotifs()
    }
  }, [removeNotifs])

  // include only if zoom between min_zoom and max_zoom
  if (
    layerPresentation.min_zoom !== undefined &&
    zoom < (layerPresentation.min_zoom as number)
  )
    return null
  if (
    layerPresentation.max_zoom !== undefined &&
    zoom > (layerPresentation.max_zoom as number)
  )
    return null

  if (!data?.length) return null
  if (!display) return null

  return (
    <ErrorBoundary layer={layer as { label: string | null }}>
      <ProgressiveGeoJSON
        resetKey={`${layer.id}/${display.marker_symbol}/${display?.marker_size}/${
          display?.color
        }/${display?.opacity_percent}/${display?.marker_type}`}
        data={data}
        featureKey={featureKey}
        geomanIgnore={true}
        // the group style is applied to every added layer; the opacity prop
        // of react-leaflet's <GeoJSON> (applied via setStyle) folds in here
        style={{
          ...vectorLayerDisplayToProperties({
            vectorLayerDisplay: display,
            presentation: layer.layer_presentations?.[0],
          }),
          opacity: display.opacity_percent ? display.opacity_percent / 100 : 0,
        }}
        onEachFeature={(feature, _layer) => {
          const layersData = [
            {
              label: layer.label,
              properties: Object.entries(feature?.properties ?? {}) as [
                string,
                ReactNode,
              ][],
            },
          ]
          // lazy popup: rendered when the popup opens, not per feature at
          // layer creation (thousands of bindPopup calls with pre-rendered
          // html)
          _layer.bindPopup(() =>
            ReactDOMServer.renderToString(
              <Popup
                layersData={layersData}
                mapSize={map.getSize()}
              />,
            ),
          )
        }}
        pointToLayer={(_geoJsonPoint, latlng) => {
          // TODO: add font-weight setting
          if (display.marker_type === 'circle') {
            return new L.CircleMarker(latlng, {
              ...display,
              geomanIgnore: true,
              radius: display.circle_marker_radius ?? 8,
            } as L.CircleMarkerOptions)
          }
          const markerIconStyle = {
            '--marker-size': `${display?.marker_size ?? 16}px`,
            ...(display?.color ? { '--marker-color': display.color } : {}),
          } as React.CSSProperties
          const html = cachedMarkerIconHtml({
            symbol: display.marker_symbol ?? 'MdPlace',
            className: `${styles.markerIcon} ${styles.markerIconSized}`,
            style: markerIconStyle,
          })
          return new L.Marker(latlng, {
            geomanIgnore: true,
            ...(html ? { icon: new L.DivIcon({ html }) } : {}),
            opacity:
              display.opacity_percent ? display.opacity_percent / 100 : 0,
          })
        }}
      />
    </ErrorBoundary>
  )
}
