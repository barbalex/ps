import { useEffect, useState, useRef, useCallback } from 'react'
import { GeoJSON, useMapEvent, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import * as icons from 'react-icons/md'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  Vector_layer_geoms as VectorLayerGeom,
  Vector_layers as VectorLayer,
  Vector_layer_displays as VectorLayerDisplay,
} from '../../../../generated/client/index.ts'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { Popup } from '../../Popup.tsx'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'
import { createNotification } from '../../../../modules/createRows.ts'

// const bboxBuffer = 0.01

interface Props {
  layer: VectorLayer
  display: VectorLayerDisplay
}

export const PVLGeom = ({ layer, display }) => {
  const db = usePGlite()
  const layerPresentation = layer.layer_presentations?.[0]

  const [data, setData] = useState()

  const notificationIds = useRef([])

  const removeNotifs = useCallback(async () => {
    await db.notifications.deleteMany({
      where: { notification_id: { in: notificationIds.current } },
    })
    notificationIds.current = []
  }, [db.notifications])

  const map = useMap()

  const [zoom, setZoom] = useState<number>(map.getZoom())

  useMapEvent('dragend zoomend ', () => {
    fetchDataDebounced({ bounds: map.getBounds() })
  })

  const fetchData = useCallback(
    async ({ bounds }) => {
      removeNotifs()
      const notificationData = createNotification({
        title: `Lade Vektor-Karte '${layer.label}'...`,
        intent: 'info',
        timeout: 100000,
      })
      db.notifications.create({ data: notificationData })
      notificationIds.current = [
        notificationData.notification_id,
        ...notificationIds.current,
      ]

      const { results: vectorLayerGeoms = [] }: { results: VectorLayerGeom[] } =
        await db.vector_layer_geoms.findMany({
          where: {
            vector_layer_id: layer.vector_layer_id,
            bbox_sw_lng: { gt: bounds._southWest.lng },
            bbox_sw_lat: { gt: bounds._southWest.lat },
            bbox_ne_lng: { lt: bounds._northEast.lng },
            bbox_ne_lat: { lt: bounds._northEast.lat },
          },
          take: layer.max_features ?? 1000,
        })

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
      db.notifications,
      db.vector_layer_geoms,
      layer.label,
      layer.vector_layer_id,
      layer.max_features,
      map,
    ],
  )
  const fetchDataDebounced = useDebouncedCallback(fetchData, 600)

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
  if (
    data?.length === (layer.max_features ?? 1000) &&
    !notificationIds.current.length
  ) {
    const data = createNotification({
      title: `Zuviele Geometrien`,
      body: `Die maximale Anzahl Features von ${
        layer.max_features ?? 1000
      } für Vektor-Karte '${layer.label}' wurde geladen. Zoomen sie näher ran`,
      intent: 'warning',
      timeout: 10000,
    })
    db.notifications.create({ data })
    notificationIds.current = [data.notification_id, ...notificationIds.current]
  }

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
            <Popup
              layersData={layersData}
              mapSize={mapSize}
            />,
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
