import { useState } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import { Map } from '@types/leaflet'
import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'
import { useAtomValue, useSetAtom } from 'jotai'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'
import { assignToNearestDroppable } from './assignToNearestDroppable.ts'
import {
  draggableLayersAtom,
  droppableLayerAtom,
  confirmAssigningToSingleTargetAtom,
  placesToAssignOccurrenceToAtom,
} from '../../../../store.ts'

export const TableLayer = ({ data, layerPresentation }) => {
  const confirmAssigningToSingleTarget = useAtomValue(
    confirmAssigningToSingleTargetAtom,
  )
  const droppableLayer = useAtomValue(droppableLayerAtom)
  const draggableLayers = useAtomValue(draggableLayersAtom)
  const setPlacesToAssignOccurrenceTo = useSetAtom(
    placesToAssignOccurrenceToAtom,
  )

  const layer = layerPresentation.vector_layers

  const layerNameForState = layer?.label?.replace?.(/ /g, '-')?.toLowerCase?.()

  const isDraggable = draggableLayers.includes(layerNameForState)

  // adapt to multiple vector_layer_displays
  const vectorLayerDisplays = layer.vector_layer_displays
  const firstDisplay = vectorLayerDisplays?.[0]

  const displayFromFeature = (feature) => {
    // display_by_property is _not_ under the data property
    // as passing the data object to feature.properties lead to errors
    const displayToUse = (vectorLayerDisplays ?? []).find(
      (vld) =>
        vld.display_property_value ===
        feature.properties?.[layer?.display_by_property],
    )

    return displayToUse ?? firstDisplay
  }

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
            const visualRadius = displayToUse.circle_marker_radius ?? 8
            // Create larger invisible circle for clicking (min 10px radius or visual + 5px)
            const clickRadius = Math.max(visualRadius + 5, 10)

            // Create the larger invisible clickable circle
            const clickableCircle = L.circleMarker(latlng, {
              radius: clickRadius,
              fillOpacity: 0,
              opacity: 0,
              stroke: false,
              interactive: true,
              ...(isDraggable ?
                { className: 'draggable-hitbox' }
              : { className: 'clickable-hitbox' }),
            })

            // Create the visible circle (non-interactive so clicks pass through)
            const visualCircle = L.circleMarker(latlng, {
              ...displayToUse,
              radius: visualRadius,
              interactive: false,
              bubblingMouseEvents: false,
              className: 'non-interactive-visual',
            })

            // Create layer group with both circles
            const marker = L.layerGroup([clickableCircle, visualCircle])
            // Copy feature to the group AND to clickableCircle for popup binding
            marker.feature = feature
            clickableCircle.feature = feature
            // Store vector layer label for grouping in info panel
            marker.vectorLayerLabel = layer?.label
            // Store reference to clickable circle for popup handling
            marker._clickableCircle = clickableCircle

            if (isDraggable) {
              // Problem: circleMarker has not draggable property
              // see: https://stackoverflow.com/a/43417693/712005

              // extract trackCursor as a function so this specific
              // "mousemove" listener can be removed on "mouseup" versus
              // all listeners if we were to use map.off("mousemove")
              const trackCursor = (e) => {
                clickableCircle.setLatLng(e.latlng)
                visualCircle.setLatLng(e.latlng)
              }

              clickableCircle.on('mousedown', function () {
                map.dragging.disable()
                map.on('mousemove', trackCursor)
              })

              clickableCircle.on('mouseup', function (e) {
                map.dragging.enable()
                map.off('mousemove', trackCursor)
                // only assign if the marker has moved
                if (
                  e.latlng.lat === latlng.lat &&
                  e.latlng.lng === latlng.lng
                ) {
                  return
                }
                assignToNearestDroppable({
                  latLng: e.latlng,
                  occurrenceId: feature.properties?.occurrence_id,
                  map,
                  droppableLayer,
                  confirmAssigningToSingleTarget,
                  setPlacesToAssignOccurrenceTo,
                })
              })
            }

            return marker
          }

          const IconComponent = icons[displayToUse.marker_symbol]

          const marker =
            IconComponent ?
              L.marker(latlng, {
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
                  className:
                    isDraggable ?
                      'draggable marker-icon-clickable'
                    : 'marker-icon-clickable',
                  iconSize: [
                    displayToUse.marker_size ?? 16,
                    displayToUse.marker_size ?? 16,
                  ],
                  iconAnchor: [
                    (displayToUse.marker_size ?? 16) / 2,
                    (displayToUse.marker_size ?? 16) / 2,
                  ],
                }),
                draggable: isDraggable,
              })
            : L.marker(latlng, {
                draggable: isDraggable,
                ...(isDraggable ? { className: 'draggable' } : {}),
              })

          // Store vector layer label for grouping in info panel
          marker.vectorLayerLabel = layer?.label

          marker.on('dragend', () => {
            const position = marker.getLatLng()
            assignToNearestDroppable({
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
        onEachFeature={(feature) => {
          if (!feature) return
          // Table layer data is shown in the Info sidebar via ClickListener
          // so we don't bind popups here
        }}
      />
    </ErrorBoundary>
  )
}
