// Store references to occurrence markers for resetting their positions
export const occurrenceMarkers = new Map<
  string,
  {
    clickableCircle: L.CircleMarker | null
    visualCircle: L.CircleMarker | null
    marker: L.Marker | null
    originalLatLng: L.LatLng
  }
>()

/**
 * Reset an occurrence marker to its original position
 * Used when user cancels assignment in the OccurrenceAssignChooser dialog
 */
export const resetOccurrenceMarkerPosition = (occurrenceId: string) => {
  const markerData = occurrenceMarkers.get(occurrenceId)
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
