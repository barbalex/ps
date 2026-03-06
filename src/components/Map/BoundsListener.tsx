import { useEffect, useRef, useCallback } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { useAtomValue, useSetAtom } from 'jotai'
import { useBeforeunload } from 'react-beforeunload'

import {
  mapBoundsAtom,
  mapViewportBoundsAtom,
  mapCenterAtom,
  mapZoomAtom,
} from '../../store.ts'

// Problem: when setting bounds from a form query, map is not available
// Solution: use BoundsListener to set bounds from here where map is available
export const BoundsListener = () => {
  const mapBounds = useAtomValue(mapBoundsAtom)
  const setMapViewportBounds = useSetAtom(mapViewportBoundsAtom)
  const storedCenter = useAtomValue(mapCenterAtom)
  const storedZoom = useAtomValue(mapZoomAtom)
  const setMapCenter = useSetAtom(mapCenterAtom)
  const setMapZoom = useSetAtom(mapZoomAtom)
  const map = useMap()

  const onMoveOrZoom = useCallback(() => {
    const bounds = map.getBounds()
    const southWest = bounds.getSouthWest()
    const northEast = bounds.getNorthEast()
    setMapViewportBounds({
      swLat: southWest.lat,
      swLng: southWest.lng,
      neLat: northEast.lat,
      neLng: northEast.lng,
    })
  }, [map, setMapViewportBounds])

  const isInitializingRef = useRef(true)
  const saveCenterAndZoom = useCallback(() => {
    if (isInitializingRef.current) return

    const center = map.getCenter()
    const zoom = map.getZoom()
    // Save to persisting atoms
    setMapCenter([center.lat, center.lng])
    setMapZoom(zoom)
  }, [map, setMapCenter, setMapZoom])

  const onMoveEndOrZoomEnd = useCallback(() => {
    onMoveOrZoom()
    saveCenterAndZoom()
  }, [onMoveOrZoom, saveCenterAndZoom])

  // Set up event listeners to save on user interaction
  useMapEvents({
    move: onMoveOrZoom,
    zoom: onMoveOrZoom,
    moveend: onMoveEndOrZoomEnd,
    zoomend: onMoveEndOrZoomEnd,
  })

  useEffect(() => {
    if (mapBounds) map.fitBounds(mapBounds)
  }, [map, mapBounds])

  useEffect(() => {
    isInitializingRef.current = true

    // Restore view from atoms immediately when map is ready
    map.whenReady(() => {
      if (storedCenter && storedZoom) {
        try {
          // Force the view regardless of current state
          map.setView(storedCenter, storedZoom, { animate: false, reset: true })

          // Retry if zoom didn't stick (seems to happen on initial load)
          setTimeout(() => {
            if (map.getZoom() !== storedZoom) {
              map.setZoom(storedZoom, { animate: false })
            }
          }, 50)

          setTimeout(() => {
            if (map.getZoom() !== storedZoom) {
              map.setZoom(storedZoom, { animate: false })
            }
          }, 150)
        } catch (e) {
          console.error('Failed to restore map view:', e)
        }
      }

      // Mark initialization as complete after enough time
      setTimeout(() => {
        isInitializingRef.current = false
      }, 500)
    })

    onMoveOrZoom()
  }, [
    map,
    setMapViewportBounds,
    setMapCenter,
    setMapZoom,
    storedCenter,
    storedZoom,
    onMoveOrZoom,
  ])

  return null
}
