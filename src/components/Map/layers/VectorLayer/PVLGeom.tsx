import { useEffect, useState, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import { GeoJSON, useMapEvent, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import * as icons from 'react-icons/md'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import type { GeoJsonObject } from 'geojson'

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
  geometry: GeoJsonObject
  properties: unknown
}

export const PVLGeom = ({ layer, display }: Props) => {
  const db = usePGlite()
  const layerPresentation = layer.layer_presentations?.[0]!
  const addNotification = useSetAtom(addNotificationAtom)
  const removeNotification = useSetAtom(removeNotificationAtom)

  const [data, setData] = useState<GeoJsonObject[]>()

  const notificationIds = useRef<string[]>([])

  const removeNotifs = useCallback(async () => {
    for (const notificationId of notificationIds.current) {
      removeNotification(notificationId)
    }
    notificationIds.current = []
  }, [removeNotification])

  const map = useMap()

  const [zoom, setZoom] = useState<number>(map.getZoom())

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
          geometry,
          properties
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
      })) as GeoJsonObject[]
      removeNotifs()

      setData(data)
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

  removeNotifs()
  // TODO: this can not work
  // if (
  //   data?.length === (layer.max_features ?? 1000) &&
  //   !notificationIds.current.length
  // ) {
  //   const res = await createNotification({
  //     title: `Zuviele Geometrien`,
  //     body: `Die maximale Anzahl Features von ${
  //       layer.max_features ?? 1000
  //     } für Vektor-Karte '${layer.label}' wurde geladen. Zoomen sie näher ran`,
  //     intent: 'warning',
  //     timeout: 10000,
  //     db,
  //   })
  //   const notificationData = res?.rows?.[0]
  //   notificationIds.current = [
  //     notificationData.id,
  //     ...notificationIds.current,
  //   ]
  // }

  if (!data?.length) return null
  if (!display) return null

  const mapSize = map.getSize()

  return (
    <ErrorBoundary layer={layer as { label: string | null }}>
      <GeoJSON
        key={`${layer.id}/${display.marker_symbol}/${display?.marker_size}/${
          display?.color
        }/${display?.opacity_percent}/${display?.marker_type}/${
          data?.length ?? 0
        }`}
        data={data as unknown as GeoJsonObject}
        {...{
          opacity: display.opacity_percent ? display.opacity_percent / 100 : 0,
        }}
        style={vectorLayerDisplayToProperties({
          vectorLayerDisplay: display,
          presentation: layer.layer_presentations?.[0],
        })}
        onEachFeature={(feature, _layer) => {
          const layersData = [
            {
              label: layer.label,
              properties: Object.entries(
                feature?.properties ?? {},
              ) as [string, ReactNode][],
            },
          ]
          const popupContent = ReactDOMServer.renderToString(
            <Popup
              layersData={layersData}
              mapSize={mapSize}
            />,
          )
          _layer.bindPopup(popupContent)
        }}
        pointToLayer={(_geoJsonPoint, latlng) => {
          // TODO: add font-weight setting
          if (display.marker_type === 'circle') {
            return L.circleMarker(latlng, {
              ...display,
              radius: display.circle_marker_radius ?? 8,
            } as L.CircleMarkerOptions)
          }
          const Component =
            icons[display.marker_symbol as keyof typeof icons] ??
            icons.MdPlace
          const markerIconStyle = {
            '--marker-size': `${display?.marker_size ?? 16}px`,
            ...(display?.color ? { '--marker-color': display.color } : {}),
          } as React.CSSProperties
          return L.marker(latlng, {
            icon: new (L.divIcon as unknown as new (
              options?: L.DivIconOptions,
            ) => L.DivIcon)({
              html: ReactDOMServer.renderToString(
                <Component
                  className={`${styles.markerIcon} ${styles.markerIconSized}`}
                  style={markerIconStyle}
                />,
              ),
            }),
            opacity:
              display.opacity_percent ? display.opacity_percent / 100 : 0,
          })
        }}
      />
    </ErrorBoundary>
  )
}
