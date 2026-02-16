import { useState } from 'react'
import { GeoJSON, useMapEvent, useMap } from 'react-leaflet'
import { Map } from '@types/leaflet'
import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'
import { useAtomValue, useSetAtom } from 'jotai'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'
import { assignToNearestDroppable } from './assignToNearestDroppable.ts'
import {
  draggableLayersAtom,
  droppableLayersAtom,
  confirmAssigningToSingleTargetAtom,
  placesToAssignOccurrenceToAtom,
} from '../../../../store.ts'
import { occurrenceMarkers } from './occurrenceMarkers.ts'

export const TableLayer = ({ data, layerPresentation }) => {
  const confirmAssigningToSingleTarget = useAtomValue(
    confirmAssigningToSingleTargetAtom,
  )
  const droppableLayers = useAtomValue(droppableLayersAtom)
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

  const map: Map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvent('zoomend', () => setZoom(map.getZoom()))

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

  // Create a stable key that changes when data content changes
  // For assignment lines, include place_ids to detect reassignments
  const dataKey = data
    .map((fc) =>
      fc.features
        ?.map(
          (f) =>
            `${f.properties?.occurrence_id || ''}_${f.properties?.place_id || ''}`,
        )
        .join(','),
    )
    .join('|')

  return (
    <ErrorBoundary layer={layer}>
      <GeoJSON
        key={`${dataKey}/${JSON.stringify(firstDisplay)}`}
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
              ...(isDraggable
                ? { className: 'draggable-hitbox' }
                : { className: 'clickable-hitbox' }),
            })
            // Store vector layer label on clickableCircle too
            clickableCircle.vectorLayerLabel = layer?.label
            // Mark as internal layer to skip in click detection
            clickableCircle._isInternal = true

            // Create the visible circle (non-interactive so clicks pass through)
            const visualCircle = L.circleMarker(latlng, {
              ...displayToUse,
              radius: visualRadius,
              interactive: false,
              bubblingMouseEvents: false,
              className: 'non-interactive-visual',
            })
            // Mark as internal layer
            visualCircle._isInternal = true

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

              // Define mouseup handler that will be attached to map
              const handleMouseUp = (e) => {
                map.dragging.enable()
                map.off('mousemove', trackCursor)
                map.off('mouseup', handleMouseUp)

                // only assign if the marker has moved
                if (
                  e.latlng.lat === latlng.lat &&
                  e.latlng.lng === latlng.lng
                ) {
                  // Reset drag flag
                  map._isDraggingOccurrence = false
                  return
                }
                // Stop propagation to prevent click event from opening info sidebar
                L.DomEvent.stopPropagation(e)
                L.DomEvent.preventDefault(e)

                // Set a flag to ignore the next click event
                clickableCircle._justDragged = true
                setTimeout(() => {
                  clickableCircle._justDragged = false
                }, 100)

                // Keep drag flag set for a short duration to prevent ClickListener from firing
                setTimeout(() => {
                  map._isDraggingOccurrence = false
                }, 150)

                assignToNearestDroppable({
                  latLng: e.latlng,
                  occurrenceId: feature.properties?.occurrence_id,
                  map,
                  droppableLayers,
                  confirmAssigningToSingleTarget,
                  setPlacesToAssignOccurrenceTo,
                })
              }

              clickableCircle.on('mousedown', function () {
                // Store marker reference and original position for potential reset
                const occurrenceId = feature.properties?.occurrence_id
                if (occurrenceId) {
                  occurrenceMarkers.set(occurrenceId, {
                    clickableCircle,
                    visualCircle,
                    marker: null,
                    originalLatLng: latlng,
                  })
                }
                // Set flag to prevent ClickListener from opening info on other layers
                map._isDraggingOccurrence = true
                map.dragging.disable()
                map.on('mousemove', trackCursor)
                // Attach mouseup to map so it fires regardless of what's under the cursor
                map.on('mouseup', handleMouseUp)
              })

              // Prevent click event immediately after drag
              clickableCircle.on('click', function (e) {
                if (clickableCircle._justDragged) {
                  L.DomEvent.stopPropagation(e)
                  L.DomEvent.preventDefault(e)
                  return false
                }
              })
            }

            return marker
          }

          const IconComponent = icons[displayToUse.marker_symbol]

          const markerSize = displayToUse.marker_size ?? 16
          const clickRadius = Math.max(markerSize / 2 + 5, 10)

          const clickableCircle = L.circleMarker(latlng, {
            radius: clickRadius,
            fillOpacity: 0,
            opacity: 0,
            stroke: false,
            interactive: true,
            ...(isDraggable
              ? { className: 'draggable-hitbox' }
              : { className: 'clickable-hitbox' }),
          })
          clickableCircle.vectorLayerLabel = layer?.label
          clickableCircle._isInternal = true

          const marker = IconComponent
            ? L.marker(latlng, {
                icon: L.divIcon({
                  html: ReactDOMServer.renderToString(
                    <IconComponent
                      style={{
                        color: displayToUse.color ?? '#cc756b',
                        fontSize: markerSize,
                        filter: 'drop-shadow(0 0 2px rgb(0 0 0 / 1))',
                      }}
                    />,
                  ),
                  className: isDraggable
                    ? 'draggable marker-icon-clickable'
                    : 'marker-icon-clickable',
                  iconSize: [markerSize, markerSize],
                  iconAnchor: [markerSize / 2, markerSize / 2],
                }),
                draggable: isDraggable,
              })
            : L.marker(latlng, {
                draggable: isDraggable,
                ...(isDraggable ? { className: 'draggable' } : {}),
              })

          const group = L.layerGroup([clickableCircle, marker])
          group.feature = feature
          clickableCircle.feature = feature
          marker.feature = feature
          group.vectorLayerLabel = layer?.label
          group._clickableCircle = clickableCircle

          if (isDraggable) {
            // Store marker reference and original position for potential reset
            const occurrenceId = feature.properties?.occurrence_id
            if (occurrenceId) {
              occurrenceMarkers.set(occurrenceId, {
                clickableCircle: null,
                visualCircle: null,
                marker,
                originalLatLng: latlng,
              })
            }

            // Set flag when drag starts
            marker.on('dragstart', () => {
              map._isDraggingOccurrence = true
            })

            marker.on('dragend', (e) => {
              const position = marker.getLatLng()
              // Prevent click event from firing after drag
              L.DomEvent.stopPropagation(e)
              L.DomEvent.preventDefault(e)
              // Set a flag to ignore the next click event
              marker._justDragged = true
              clickableCircle._justDragged = true
              setTimeout(() => {
                marker._justDragged = false
                clickableCircle._justDragged = false
              }, 100)
              // Keep drag flag set for a short duration to prevent ClickListener from firing
              setTimeout(() => {
                map._isDraggingOccurrence = false
              }, 150)
              assignToNearestDroppable({
                latLng: position,
                occurrenceId: marker.feature.properties?.occurrence_id,
                map,
                droppableLayers,
                confirmAssigningToSingleTarget,
                setPlacesToAssignOccurrenceTo,
              })
            })

            // Prevent click event immediately after drag
            marker.on('click', (e) => {
              if (marker._justDragged) {
                L.DomEvent.stopPropagation(e)
                L.DomEvent.preventDefault(e)
                return false
              }
            })

            // Also prevent click on the clickable circle after drag
            clickableCircle.on('click', (e) => {
              if (clickableCircle._justDragged) {
                L.DomEvent.stopPropagation(e)
                L.DomEvent.preventDefault(e)
                return false
              }
            })
          }

          return group
        }}
        onEachFeature={(feature, geoLayer) => {
          if (!feature) return
          if (geoLayer) {
            geoLayer.vectorLayerLabel = layer?.label
          }
          // Table layer data is shown in the Info sidebar via ClickListener
          // so we don't bind popups here
        }}
      />
    </ErrorBoundary>
  )
}
