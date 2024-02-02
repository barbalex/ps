import { useEffect, useState, useRef, useCallback } from 'react'
import { GeoJSON, useMapEvent, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import * as icons from 'react-icons/md'
import { uuidv7 } from '@kripod/uuidv7'
import { css } from '../../../css'

import {
  Vector_layer_geoms as VectorLayerGeom,
  Vector_layers as VectorLayer,
  Layer_styles as LayerStyle,
  Ui_options as UiOption,
} from '../../../generated/client'

import { layerstyleToProperties } from '../../../modules/layerstyleToProperties'
import { Popup } from '../Popup'
import { ErrorBoundary } from '../MapErrorBoundary'
import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

// const bboxBuffer = 0.01

type Props = {
  layer: VectorLayer
}

export const VectorLayerPVLGeom = ({ layer }: Props) => {
  const { db } = useElectric()!
  const uiOption: UiOption = db.ui_options.liveUnique({ where: { user_id } })
  const showMap = uiOption?.show_map ?? false

  const [data, setData] = useState()

  const notificationIds = useRef([])

  const removeNotifs = useCallback(async () => {
    // console.log('removing notifs')
    await db.notifications.deleteMany({
      where: { notification_id: { in: notificationIds.current } },
    })
    notificationIds.current = []
  }, [db.notifications])

  const map = useMap()

  const [zoom, setZoom] = useState<number>(map.getZoom())
  const [layerStyle, setLayerStyle] = useState<LayerStyle>()

  useMapEvent('dragend zoomend ', () => {
    // console.log('dragend zoomend ')
    fetchDataDebounced({ bounds: map.getBounds() })
  })

  const fetchData = useCallback(
    async ({ bounds }) => {
      if (!showMap) return
      // console.log('VectorLayerPVLGeom fetching data')
      removeNotifs()
      const notification_id = uuidv7()
      db.notifications.create({
        data: {
          notification_id,
          title: `Lade Vektor-Karte '${layer.label}'...`,
          intent: 'info',
          timeout: 100000,
        },
      })
      notificationIds.current = [notification_id, ...notificationIds.current]

      const { results: vectorLayerGeoms = [] }: { results: VectorLayerGeom[] } =
        await db.vector_layer_geoms.findMany({
          where: {
            vector_layer_id: layer.vector_layer_id,
            deleted: false,
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

      const layerStyle: LayerStyle = await db.layer_styles.findUnique({
        where: { vector_layer_id: layer.vector_layer_id },
      })
      setData(data)
      setLayerStyle(layerStyle)
      setZoom(map.getZoom())
    },
    [
      db.layer_styles,
      db.notifications,
      db.vector_layer_geoms,
      layer.label,
      layer.max_features,
      layer.vector_layer_id,
      map,
      removeNotifs,
      showMap,
    ],
  )
  const fetchDataDebounced = useDebouncedCallback(fetchData, 600)

  useEffect(() => {
    fetchDataDebounced({ bounds: map.getBounds() })
  }, [fetchDataDebounced, map, showMap])

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
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null

  removeNotifs()
  if (
    data?.length === (layer.max_features ?? 1000) &&
    !notificationIds.current.length
  ) {
    const notification_id = uuidv7()
    db.notifications.create({
      data: {
        notification_id,
        title: `Zuviele Geometrien`,
        body: `Die maximale Anzahl Features von ${
          layer.max_features ?? 1000
        } für Vektor-Karte '${
          layer.label
        }' wurde geladen. Zoomen sie näher ran`,
        intent: 'warning',
        timeout: 10000,
      },
    })
    notificationIds.current = [notification_id, ...notificationIds.current]
  }

  if (!data?.length) return null
  if (!layerStyle) return null

  const mapSize = map.getSize()

  return (
    <ErrorBoundary layer={layer}>
      <GeoJSON
        key={`${layer.id}/${layerStyle.marker_symbol}/${
          layerStyle?.marker_size
        }/${layerStyle?.color}/${layerStyle?.opacity}/${
          layerStyle?.marker_type
        }/${layerStyle?.marker_weight}/${data?.length ?? 0}`}
        data={data}
        opacity={layer.opacity_percent ? layer.opacity_percent / 100 : 0}
        style={layerstyleToProperties({ layerStyle })}
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
          if (layerStyle.marker_type === 'circle') {
            return L.circleMarker(latlng, {
              ...layerStyle,
              radius: layerStyle.circle_marker_radius ?? 8,
            })
          }
          const Component = icons[layerStyle.marker_symbol] ?? icons.MdPlace
          return L.marker(latlng, {
            icon: new L.divIcon({
              html: ReactDOMServer.renderToString(
                <Component
                  style={css({
                    color: layerStyle?.color,
                    fontSize: `${layerStyle?.marker_size ?? 16}px`,
                    ...(layerStyle.marker_weight
                      ? {
                          'path:nth-of-type(2)': {
                            strokeWidth: layerStyle.marker_weight,
                          },
                        }
                      : {}),
                  })}
                />,
              ),
            }),
            opacity: layerStyle.opacity_percent
              ? layerStyle.opacity_percent / 100
              : 0,
          })
        }}
      />
    </ErrorBoundary>
  )
}
