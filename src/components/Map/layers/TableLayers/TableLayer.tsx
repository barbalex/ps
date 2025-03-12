import { useState, memo, useCallback } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import { Map } from '@types/leaflet'
import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { formatNumber } from '../../../../modules/formatNumber.ts'
import { Popup } from '../../Popup.tsx'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'
import { assignToNearestDroppable } from './assignToNearestDroppable.ts'
import {
  draggableLayersAtom,
  droppableLayerAtom,
  confirmAssigningToSingleTargetAtom,
  placesToAssignOccurrenceToAtom,
} from '../../../../store.ts'

export const TableLayer = memo(({ data, layerPresentation }) => {
  const [confirmAssigningToSingleTarget] = useAtom(
    confirmAssigningToSingleTargetAtom,
  )
  const [droppableLayer] = useAtom(droppableLayerAtom)
  const [draggableLayers] = useAtom(draggableLayersAtom)
  const setPlacesToAssignOccurrenceTo = useSetAtom(
    placesToAssignOccurrenceToAtom,
  )

  const db = usePGlite()
  const layer = layerPresentation.vector_layers

  const layerNameForState = layer?.label?.replace?.(/ /g, '-')?.toLowerCase?.()

  const isDraggable = draggableLayers.includes(layerNameForState)

  // adapt to multiple vector_layer_displays
  const vectorLayerDisplays = layer.vector_layer_displays
  const firstDisplay = vectorLayerDisplays?.[0]

  const displayFromFeature = useCallback(
    (feature) => {
      // display_by_property is _not_ under the data property
      // as passing the data object to feature.properties lead to errors
      const displayToUse = (vectorLayerDisplays ?? []).find(
        (vld) =>
          vld.display_property_value ===
          feature.properties?.[layer?.display_by_property],
      )

      return displayToUse ?? firstDisplay
    },
    [firstDisplay, layer?.display_by_property, vectorLayerDisplays],
  )

  const map: Map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  if (!firstDisplay) return null
  if (!layer) return null
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
  if (!data?.length) return null

  const mapSize = map.getSize()

  return (
    <ErrorBoundary layer={layer}>
      <GeoJSON
        key={`${data.length ?? 0}/${JSON.stringify(firstDisplay)}`}
        data={data}
        // style by properties, use a function that receives the feature: https://stackoverflow.com/a/66106512/712005
        style={(feature) => {
          // need to choose display to pass in
          const displayToUse = displayFromFeature(feature)

          return vectorLayerDisplayToProperties({
            vectorLayerDisplay: displayToUse,
            presentation: layerPresentation,
          })
        }}
        pointToLayer={(feature, latlng) => {
          const displayToUse = displayFromFeature(feature)

          if (displayToUse.marker_type === 'circle') {
            const marker = L.circleMarker(latlng, {
              ...displayToUse,
              radius: displayToUse.circle_marker_radius ?? 8,
              ...(isDraggable ? { className: 'draggable' } : {}),
            })

            if (!isDraggable) return marker
            // Problem: circleMarker has not draggable property
            // see: https://stackoverflow.com/a/43417693/712005

            // extract trackCursor as a function so this specific
            // "mousemove" listener can be removed on "mouseup" versus
            // all listeners if we were to use map.off("mousemove")
            const trackCursor = (e) => {
              marker.setLatLng(e.latlng)
            }

            marker.on('mousedown', function () {
              map.dragging.disable()
              map.on('mousemove', trackCursor)
            })

            marker.on('mouseup', function (e) {
              map.dragging.enable()
              map.off('mousemove', trackCursor)
              // only assign if the marker has moved
              if (e.latlng.lat === latlng.lat && e.latlng.lng === latlng.lng) {
                return
              }
              assignToNearestDroppable({
                db,
                latLng: e.latlng,
                occurrenceId: marker.feature.properties?.occurrence_id,
                map,
                droppableLayer,
                confirmAssigningToSingleTarget,
                setPlacesToAssignOccurrenceTo,
              })
            })

            return marker
          }

          const IconComponent = icons[displayToUse.marker_symbol]

          const marker = IconComponent
            ? L.marker(latlng, {
                icon: L.divIcon({
                  html: ReactDOMServer.renderToString(
                    <IconComponent
                      style={{
                        color: displayToUse.color ?? '#cc756b',
                        fontSize: displayToUse.marker_size ?? 16,
                        filter: 'drop-shadow(0 0 2px rgb(0 0 0 / 1))',
                      }}
                    />,
                  ),
                  ...(isDraggable ? { className: 'draggable' } : {}),
                }),
                draggable: isDraggable,
              })
            : L.marker(latlng, {
                draggable: isDraggable,
                ...(isDraggable ? { className: 'draggable' } : {}),
              })

          marker.on('dragend', (e) => {
            const position = marker.getLatLng()
            assignToNearestDroppable({
              db,
              latLng: position,
              occurrenceId: marker.feature.properties?.occurrence_id,
              map,
              droppableLayer,
              confirmAssigningToSingleTarget,
              setPlacesToAssignOccurrenceTo,
            })
          })

          return marker
        }}
        onEachFeature={(feature, _layer) => {
          if (!feature) return
          // draggable markers pop up on dragend (mouseup)
          if (isDraggable) return

          const layersData = [
            {
              label: feature.label,
              properties: Object.entries(feature?.properties ?? {}).map(
                ([key, value]) => {
                  // if value is a date, format it
                  // the date object blows up
                  if (value instanceof Date) {
                    return [key, formatNumber(value)]
                  }
                  return [key, value]
                },
              ),
            },
          ]
          // TODO: idea
          // open form in iframe
          // but: electric-sql syncing errors...
          // const src =
          //   'http://localhost:5173/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subprojects/018cfd27-ee92-7000-b678-e75497d6c60e/places/018dacec-eef1-7000-8801-353c1a84c65b?onlyForm=true'
          // this would definitely work better with qwick
          const popupContent = ReactDOMServer.renderToString(
            <Popup
              layersData={layersData}
              mapSize={mapSize}
              // src={src}
            />,
          )
          _layer.bindPopup(popupContent)
        }}
      />
    </ErrorBoundary>
  )
})
