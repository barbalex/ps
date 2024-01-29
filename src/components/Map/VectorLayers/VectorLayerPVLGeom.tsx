import { useEffect, useState, useContext, useRef, useCallback } from 'react'
import { GeoJSON, useMapEvent, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'
import * as icons from 'react-icons/md'
import styled from '@emotion/styled'

import {
  Vector_layer_geoms as VectorLayerGeom,
  Vector_layers as VectorLayer,
  Layer_styles as LayerStyle,
} from '../../../generated/client'

import layerstyleToProperties from '../../../utils/layerstyleToProperties'
import { Popup } from '../Popup'
import storeContext from '../../../storeContext'
import MapErrorBoundary from '../MapErrorBoundary'
import { IStore } from '../../../store'
import { useElectric } from '../../../ElectricProvider'

// const bboxBuffer = 0.01

type Props = {
  layer: VectorLayer
}
export const VectorLayerComponent = ({ layer }: Props) => {
  const { db } = useElectric()!

  const [data, setData] = useState()

  const store: IStore = useContext(storeContext)
  const { addNotification, removeNotificationById, showMap } = store

  const removeNotifs = useCallback(() => {
    // console.log('removing notifs')
    loadingNotifIds.current.forEach((id) => removeNotificationById(id))
    loadingNotifIds.current = []
  }, [removeNotificationById])

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
      // TODO: manage notifications
      removeNotifs()
      const loadingNotifId = addNotification({
        message: `Lade Vektor-Karte '${layer.label}'...`,
        type: 'info',
        duration: 100000,
      })
      loadingNotifIds.current = [loadingNotifId, ...loadingNotifIds.current]

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
      // TODO: manage notifications
      removeNotifs()

      const layerStyle: LayerStyle = await db.layer_styles.findUnique({
        where: { vector_layer_id: layer.vector_layer_id },
      })
      setData(data)
      setLayerStyle(layerStyle)
      setZoom(map.getZoom())
    },
    [
      addNotification,
      db.layer_styles,
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
  const loadingNotifIds = useRef([])

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
    data?.length === layer.max_features ??
    (1000 && !loadingNotifIds.current.length)
  ) {
    const loadingNotifId = addNotification({
      title: `Zuviele Geometrien`,
      message: `Die maximale Anzahl Features von ${
        layer.max_features ?? 1000
      } für Vektor-Karte '${layer.label}' wurde geladen. Zoomen sie näher ran`,
      type: 'warning',
    })
    loadingNotifIds.current = [loadingNotifId, ...loadingNotifIds.current]
  }

  if (!data?.length) return null
  if (!layerStyle) return null

  const mapSize = map.getSize()

  return (
    <MapErrorBoundary layer={layer}>
      <GeoJSON
        key={`${layer.id}/${layerStyle.marker_symbol}/${
          layerStyle?.marker_size
        }/${layerStyle?.color}/${layerStyle?.opacity}/${
          layerStyle?.marker_type
        }/${layerStyle?.marker_weight}/${data?.length ?? 0}`}
        data={data}
        opacity={layer.opacity}
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
          let Component = icons[layerStyle.marker_symbol] ?? icons.MdPlace
          if (layerStyle.marker_weight) {
            Component = styled(Component)`
              path:nth-of-type(2) {
                stroke-width: ${layerStyle.marker_weight};
              }
            `
          }
          return L.marker(latlng, {
            icon: new L.divIcon({
              html: ReactDOMServer.renderToString(
                <Component
                  style={{
                    color: layerStyle?.color,
                    fontSize: `${layerStyle?.marker_size ?? 16}px`,
                  }}
                />,
              ),
            }),
            opacity: layerStyle.opacity,
          })
        }}
      />
    </MapErrorBoundary>
  )
}
