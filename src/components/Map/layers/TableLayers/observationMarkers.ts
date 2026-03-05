// Store references to observation markers for resetting their positions
export const observationMarkers = new Map<
  string,
  {
    clickableCircle: L.CircleMarker | null
    visualCircle: L.CircleMarker | null
    marker: L.Marker | null
    originalLatLng: L.LatLng
  }
>()

/**
 * Reset an observation marker to its original position
 * Used when user cancels assignment in the ObservationAssignChooser dialog
 */
export const resetObservationMarkerPosition = (observationId: string) => {
  const markerData = observationMarkers.get(observationId)
  if (markerData) {
    const { clickableCircle, visualCircle, marker, originalLatLng } = markerData
    if (clickableCircle && visualCircle) {
      // For circle markers with custom drag implementation
      clickableCircle.setLatLng(originalLatLng)
      visualCircle.setLatLng(originalLatLng)
    } else if (marker) {
      // For icon markers with native Leaflet draggable
      marker.setLatLng(originalLatLng)
    }
  }
}
