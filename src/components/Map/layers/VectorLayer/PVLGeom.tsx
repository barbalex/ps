import { useEffect, useState, useRef, useCallback } from 'react'
import { GeoJSON, useMapEvent, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import * as icons from 'react-icons/md'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { Popup } from '../../Popup.tsx'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'
import { createNotification } from '../../../../modules/createRows.ts'
import {
  addNotificationAtom,
  removeNotificationByIdAtom,
} from '../../../../store.ts'

// const bboxBuffer = 0.01

export const PVLGeom = ({ layer, display }) => {
  const db = usePGlite()
  const layerPresentation = layer.layer_presentations?.[0]
  const addNotification = useSetAtom(addNotificationAtom)
  const removeNotificationById = useSetAtom(removeNotificationByIdAtom)

  const [data, setData] = useState()

  const notificationIds = useRef([])

  const removeNotifs = useCallback(async () => {
    for (const notificationId of notificationIds.current) {
      removeNotificationById(notificationId)
    }
    notificationIds.current = []
  }, [removeNotificationById])

  const map = useMap()

  const [zoom, setZoom] = useState<number>(map.getZoom())

  const fetchData = useCallback(
    async ({ bounds }) => {
      removeNotifs()
      const notificationId = addNotification({
        title: `Lade Vektor-Karte '${layer.label}'...`,
        intent: 'info',
      })
      notificationIds.current = [notificationId, ...notificationIds.current]

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
      const vectorLayerGeoms = resVectorLayerGeoms?.rows ?? []

      const data = vectorLayerGeoms.map((pvlGeom) => ({
        ...pvlGeom.geometry,
        properties: pvlGeom.properties,
      }))
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

  useMapEvent('dragend zoomend ', () => {
    fetchDataDebounced({ bounds: map.getBounds() })
  })

  useEffect(() => {
    fetchDataDebounced({ bounds: map.getBounds() })
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
    zoom < layerPresentation.min_zoom
  )
    return null
  if (
    layerPresentation.max_zoom !== undefined &&
    zoom > layerPresentation.max_zoom
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
  //     notificationData.notification_id,
  //     ...notificationIds.current,
  //   ]
  // }

  if (!data?.length) return null
  if (!display) return null

  const mapSize = map.getSize()

  return (
    <ErrorBoundary layer={layer}>
      <GeoJSON
        key={`${layer.id}/${display.marker_symbol}/${display?.marker_size}/${
          display?.color
        }/${display?.opacity_percent}/${display?.marker_type}/${
          data?.length ?? 0
        }`}
        data={data}
        opacity={display.opacity_percent ? display.opacity_percent / 100 : 0}
        style={vectorLayerDisplayToProperties({
          vectorLayerDisplay: display,
          presentation: layer.layer_presentations?.[0],
        })}
        onEachFeature={(feature, _layer) => {
          const layersData = [
            {
              label: layer.label,
              properties: Object.entries(feature?.properties ?? {}),
            },
          ]
          const popupContent = ReactDOMServer.renderToString(
            <Popup layersData={layersData} mapSize={mapSize} />,
          )
          _layer.bindPopup(popupContent)
        }}
        pointToLayer={(geoJsonPoint, latlng) => {
          // TODO: add font-weight setting
          if (display.marker_type === 'circle') {
            return L.circleMarker(latlng, {
              ...display,
              radius: display.circle_marker_radius ?? 8,
            })
          }
          const Component = icons[display.marker_symbol] ?? icons.MdPlace
          return L.marker(latlng, {
            icon: new L.divIcon({
              html: ReactDOMServer.renderToString(
                <Component
                  style={{
                    color: display?.color,
                    fontSize: display?.marker_size ?? 16,
                    filter: 'drop-shadow(0 0 2px rgb(0 0 0 / 1))',
                  }}
                />,
              ),
            }),
            opacity: display.opacity_percent
              ? display.opacity_percent / 100
              : 0,
          })
        }}
      />
    </ErrorBoundary>
  )
}
