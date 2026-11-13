import { useState, useRef, useMemo } from 'react'
import { useMapEvent, useMapEvents, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import { useAtomValue, useSetAtom } from 'jotai'
import type { Feature, FeatureCollection } from 'geojson'

import { ProgressiveGeoJSON } from '../ProgressiveGeoJSON.tsx'
import { cachedMarkerIconHtml } from '../markerIconHtml.tsx'

import { vectorLayerDisplayToProperties } from '../../../../modules/vectorLayerDisplayToProperties.ts'
import { propertyValueToText } from '../../../../modules/displayByProperty.ts'
import { useVectorLayerLabel } from '../../../../modules/vectorLayerLabel.ts'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'
import { assignToNearestDroppable } from './assignToNearestDroppable.ts'
import {
  draggableLayersAtom,
  droppableLayersAtom,
  confirmAssigningToSingleTargetAtom,
  placesToAssignObservationToAtom,
} from '../../../../store.ts'
import { observationMarkers } from './observationMarkers.ts'
import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import type VectorLayers from '../../../../models/public/VectorLayers.ts'
import type VectorLayerDisplays from '../../../../models/public/VectorLayerDisplays.ts'
import styles from './TableLayer.module.css'

export type TableLayerVectorLayer = VectorLayers & {
  label: string | null
  vector_layer_displays?: VectorLayerDisplays[] | null
}

export type TableLayerProps = {
  data: FeatureCollection[]
  layerPresentation: LayerPresentations & {
    vector_layers: TableLayerVectorLayer
  }
  activeId?: string | null
  activeIdField?: string | null
}

// Leaflet's Map with the flag used to suppress click handling during drags
type MapWithDragState = L.Map & { _isDraggingObservation?: boolean }

// distinct look of confirmed absences (observations.absence), matching the
// red of the AbsenzBadge: hollow red circles / faded red markers
const ABSENCE_COLOR = '#d13438'

// Leaflet layers carrying internal marker metadata used for hit detection
type CircleMarkerWithMeta = L.CircleMarker & {
  vectorLayerLabel?: string
  _isInternal?: boolean
  _justDragged?: boolean
}

type MarkerWithMeta = L.Marker & {
  _justDragged?: boolean
}

type LayerGroupWithMeta = L.LayerGroup & {
  vectorLayerLabel?: string
  _clickableCircle?: L.CircleMarker
}

type LayerWithMeta = L.Layer & {
  vectorLayerLabel?: string
}

export const TableLayer = ({
  data,
  layerPresentation,
  activeId = null,
  activeIdField = null,
}: TableLayerProps) => {
  const confirmAssigningToSingleTarget = useAtomValue(
    confirmAssigningToSingleTargetAtom,
  )
  const droppableLayers = useAtomValue(droppableLayersAtom)
  const draggableLayers = useAtomValue(draggableLayersAtom)
  const setPlacesToAssignObservationTo = useSetAtom(
    placesToAssignObservationToAtom,
  )

  const layer = layerPresentation.vector_layers

  // Derived display label (own layers derive it from place_levels) for the info
  // panel, and the stable `name` as the drag/drop identity key.
  const label = useVectorLayerLabel(layer, layer?.project_id)
  const layerNameForState = layer?.name

  const isDraggable = draggableLayers.includes(layerNameForState as string)

  // adapt to multiple vector_layer_displays
  const vectorLayerDisplays = layer.vector_layer_displays
  const firstDisplay = vectorLayerDisplays?.[0]

  // when the layer is styled by absence via displays, the configured styling
  // replaces the hardcoded absence look
  const absenceStyledByDisplays = layer?.display_by_property === 'absence'

  const displayFromFeature = (
    feature: Feature | undefined,
  ): VectorLayerDisplays => {
    // display_by_property is _not_ under the data property
    // as passing the data object to feature.properties lead to errors
    // display_property_value is text while property values are raw jsonb
    // (booleans, numbers) — compare via their text representation
    const valueText = propertyValueToText(
      feature?.properties?.[layer?.display_by_property as string],
    )
    const displayToUse = (vectorLayerDisplays ?? []).find(
      (vld) => propertyValueToText(vld.display_property_value) === valueText,
    )

    return (displayToUse ?? firstDisplay) as VectorLayerDisplays
  }

  const map = useMap() as MapWithDragState
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvent('zoomend', () => setZoom(map.getZoom()))

  // Holds the per-feature callbacks for an active observation drag.
  // map.on('mousemove') / map.on('mouseup') are replaced by delegating
  // through this ref from component-level useMapEvents handlers.
  const draggingRef = useRef<{
    trackCursor: (e: L.LeafletMouseEvent) => void
    handleMouseUp: (e: L.LeafletMouseEvent) => void
  } | null>(null)
  useMapEvents({
    pointermove: (e) =>
      draggingRef.current?.trackCursor(e as L.LeafletMouseEvent),
    pointerup: (e) =>
      draggingRef.current?.handleMouseUp(e as L.LeafletMouseEvent),
  })

  // Create a stable key that changes when data content changes
  // For assignment lines, include place_ids to detect reassignments
  // (before the early returns below — hooks must not be conditional)
  const dataKey = useMemo(
    () =>
      data
        .map((fc) =>
          fc.features
            ?.map(
              (f) =>
                `${f.properties?.observation_id || ''}_${f.properties?.place_id || ''}`,
            )
            .join(','),
        )
        .join('|'),
    [data],
  )

  if (!firstDisplay) return null
  if (!layer) return null
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

  return (
    <ErrorBoundary layer={layer}>
      <ProgressiveGeoJSON
        resetKey={`${dataKey}/${JSON.stringify(firstDisplay)}/${activeId ?? ''}`}
        data={data}
        // style by properties, use a function that receives the feature: https://stackoverflow.com/a/66106512/712005
        style={(feature) => {
          // need to choose display to pass in
          const displayToUse = displayFromFeature(feature)

          const baseStyle = vectorLayerDisplayToProperties({
            vectorLayerDisplay: displayToUse,
            presentation: layerPresentation,
          })
          const style =
            !absenceStyledByDisplays && feature?.properties?.absence === true ?
              {
                ...baseStyle,
                color: ABSENCE_COLOR,
                fillColor: 'transparent',
                fillOpacity: 0,
              }
            : baseStyle
          if (
            activeId &&
            activeIdField &&
            feature?.properties?.[activeIdField] === activeId
          ) {
            // yellow glow around the geometry, see .activeHalo in
            // TableLayer.module.css — applied at path creation, which is
            // fine because the resetKey includes activeId
            return {
              ...style,
              className: `${style.className ?? ''} ${styles.activeHalo}`.trim(),
            }
          }
          return style
        }}
        pointToLayer={(feature, latlng) => {
          const displayToUse = displayFromFeature(feature)

          const isActiveFeature =
            !!activeId &&
            !!activeIdField &&
            feature?.properties?.[activeIdField] === activeId

          if (displayToUse.marker_type === 'circle') {
            const visualRadius = displayToUse.circle_marker_radius ?? 8
            // Create larger invisible circle for clicking (min 10px radius or visual + 5px)
            const clickRadius = Math.max(visualRadius + 5, 10)

            // Create the larger invisible clickable circle
            const clickableCircle = new L.CircleMarker(latlng, {
              radius: clickRadius,
              fillOpacity: 0,
              opacity: 0,
              stroke: false,
              interactive: true,
              // not editable via leaflet-geoman; only DrawControl geometry is
              geomanIgnore: true,
              ...(isDraggable ?
                { className: 'draggable-hitbox' }
              : { className: 'clickable-hitbox' }),
            }) as CircleMarkerWithMeta
            // Store vector layer label on clickableCircle too
            clickableCircle.vectorLayerLabel = label
            // Mark as internal layer to skip in click detection
            clickableCircle._isInternal = true

            // Create the visible circle (non-interactive so clicks pass through)
            const visualCircle = new L.CircleMarker(latlng, {
              ...displayToUse,
              geomanIgnore: true,
              // absences: hollow red
              ...((
                !absenceStyledByDisplays &&
                feature?.properties?.absence === true
              ) ?
                {
                  color: ABSENCE_COLOR,
                  fillColor: 'transparent',
                  fillOpacity: 0,
                }
              : {}),
              radius: visualRadius,
              interactive: false,
              bubblingMouseEvents: false,
              // the active object glows yellow like lines/polygons do
              className:
                isActiveFeature ?
                  `non-interactive-visual ${styles.activeHalo}`
                : 'non-interactive-visual',
            } as L.CircleMarkerOptions) as CircleMarkerWithMeta
            // Mark as internal layer
            visualCircle._isInternal = true

            const marker = new L.LayerGroup([
              clickableCircle,
              visualCircle,
            ]) as LayerGroupWithMeta
            // Copy feature to the group AND to clickableCircle for popup binding
            ;(marker as unknown as { feature?: Feature }).feature = feature
            clickableCircle.feature = feature
            // Store vector layer label for grouping in info panel
            marker.vectorLayerLabel = label
            // Store reference to clickable circle for popup handling
            marker._clickableCircle = clickableCircle

            if (isDraggable) {
              // Problem: circleMarker has not draggable property
              // see: https://stackoverflow.com/a/43417693/712005

              // extract trackCursor as a function so this specific
              // drag can be cancelled by clearing draggingRef
              const trackCursor = (e: L.LeafletMouseEvent) => {
                clickableCircle.setLatLng(e.latlng)
                visualCircle.setLatLng(e.latlng)
              }

              // Define mouseup handler; registered via component-level useMapEvents
              const handleMouseUp = (e: L.LeafletMouseEvent) => {
                map.dragging.enable()
                draggingRef.current = null

                // only assign if the marker has moved
                if (
                  e.latlng.lat === latlng.lat &&
                  e.latlng.lng === latlng.lng
                ) {
                  // Reset drag flag
                  map._isDraggingObservation = false
                  return
                }
                // Stop propagation to prevent click event from opening info sidebar
                L.DomEvent.stopPropagation(e as unknown as Event)
                L.DomEvent.preventDefault(e as unknown as Event)

                // Set a flag to ignore the next click event
                clickableCircle._justDragged = true
                setTimeout(() => {
                  clickableCircle._justDragged = false
                }, 100)

                // Keep drag flag set for a short duration to prevent ClickListener from firing
                setTimeout(() => {
                  map._isDraggingObservation = false
                }, 150)

                assignToNearestDroppable({
                  latLng: e.latlng,
                  observationId: feature.properties?.observation_id,
                  map,
                  droppableLayers,
                  confirmAssigningToSingleTarget,
                  setPlacesToAssignObservationTo,
                })
              }

              clickableCircle.on('pointerdown', function () {
                // Store marker reference and original position for potential reset
                const observationId = feature.properties?.observation_id
                if (observationId) {
                  observationMarkers.set(observationId, {
                    clickableCircle,
                    visualCircle,
                    marker: null,
                    originalLatLng: latlng,
                  })
                }
                // Set flag to prevent ClickListener from opening info on other layers
                map._isDraggingObservation = true
                map.dragging.disable()
                draggingRef.current = { trackCursor, handleMouseUp }
              })

              // Prevent click event immediately after drag
              clickableCircle.on('click', function (e) {
                if (clickableCircle._justDragged) {
                  L.DomEvent.stopPropagation(e as unknown as Event)
                  L.DomEvent.preventDefault(e as unknown as Event)
                  return false
                }
              })
            }

            return marker
          }

          const markerSize = displayToUse.marker_size ?? 16
          const clickRadius = Math.max(markerSize / 2 + 5, 10)

          const clickableCircle = new L.CircleMarker(latlng, {
            radius: clickRadius,
            fillOpacity: 0,
            opacity: 0,
            stroke: false,
            interactive: true,
            // not editable via leaflet-geoman; only DrawControl geometry is
            geomanIgnore: true,
            ...(isDraggable ?
              { className: 'draggable-hitbox' }
            : { className: 'clickable-hitbox' }),
          }) as CircleMarkerWithMeta
          clickableCircle.vectorLayerLabel = label
          clickableCircle._isInternal = true

          const markerColor =
            !absenceStyledByDisplays && feature?.properties?.absence === true ?
              ABSENCE_COLOR
            : (displayToUse.color ?? '#cc756b')
          const markerIconStyle = {
            '--marker-color': markerColor,
            '--marker-size': `${markerSize}px`,
            // absences: faded
            ...((
              !absenceStyledByDisplays && feature?.properties?.absence === true
            ) ?
              { opacity: '0.5' }
            : {}),
          } as React.CSSProperties

          const iconHtml = cachedMarkerIconHtml({
            symbol: displayToUse.marker_symbol,
            className: `${styles.markerIcon} ${styles.markerIconSized}${
              isActiveFeature ? ` ${styles.activeHalo}` : ''
            }`,
            style: markerIconStyle,
          })

          const marker = (
            iconHtml ?
              new L.Marker(latlng, {
                icon: new L.DivIcon({
                  // Keep runtime values as CSS variables while moving declarations to CSS module.
                  // This removes static inline styling from JSX.
                  html: iconHtml,
                  className:
                    isDraggable ?
                      'draggable marker-icon-clickable'
                    : 'marker-icon-clickable',
                  iconSize: [markerSize, markerSize],
                  iconAnchor: [markerSize / 2, markerSize / 2],
                }),
                draggable: isDraggable,
                geomanIgnore: true,
              })
            : new L.Marker(latlng, {
                draggable: isDraggable,
                geomanIgnore: true,
                ...(isDraggable ? { className: 'draggable' } : {}),
              })) as MarkerWithMeta

          const group = new L.LayerGroup([
            clickableCircle,
            marker,
          ]) as LayerGroupWithMeta
          ;(group as unknown as { feature?: Feature }).feature = feature
          clickableCircle.feature = feature
          marker.feature = feature
          group.vectorLayerLabel = label
          group._clickableCircle = clickableCircle

          if (isDraggable) {
            // Store marker reference and original position for potential reset
            const observationId = feature.properties?.observation_id
            if (observationId) {
              observationMarkers.set(observationId, {
                clickableCircle: null,
                visualCircle: null,
                marker,
                originalLatLng: latlng,
              })
            }

            // Set flag when drag starts
            marker.on('dragstart', () => {
              map._isDraggingObservation = true
            })

            marker.on('dragend', (e) => {
              const position = marker.getLatLng()
              // Prevent click event from firing after drag
              L.DomEvent.stopPropagation(e as unknown as Event)
              L.DomEvent.preventDefault(e as unknown as Event)
              // Set a flag to ignore the next click event
              marker._justDragged = true
              clickableCircle._justDragged = true
              setTimeout(() => {
                marker._justDragged = false
                clickableCircle._justDragged = false
              }, 100)
              // Keep drag flag set for a short duration to prevent ClickListener from firing
              setTimeout(() => {
                map._isDraggingObservation = false
              }, 150)
              assignToNearestDroppable({
                latLng: position,
                observationId: marker.feature!.properties?.observation_id,
                map,
                droppableLayers,
                confirmAssigningToSingleTarget,
                setPlacesToAssignObservationTo,
              })
            })

            // Prevent click event immediately after drag
            marker.on('click', (e) => {
              if (marker._justDragged) {
                L.DomEvent.stopPropagation(e as unknown as Event)
                L.DomEvent.preventDefault(e as unknown as Event)
                return false
              }
            })

            // Also prevent click on the clickable circle after drag
            clickableCircle.on('click', (e) => {
              if (clickableCircle._justDragged) {
                L.DomEvent.stopPropagation(e as unknown as Event)
                L.DomEvent.preventDefault(e as unknown as Event)
                return false
              }
            })
          }

          return group
        }}
        onEachFeature={(feature, geoLayer) => {
          if (!feature) return
          if (geoLayer) {
            ;(geoLayer as LayerWithMeta).vectorLayerLabel = label
          }
          // Table layer data is shown in the Info sidebar via ClickListener
          // so we don't bind popups here
        }}
      />
    </ErrorBoundary>
  )
}
