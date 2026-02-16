import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useAtomValue, useSetAtom } from 'jotai'

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

  useEffect(() => {
    if (mapBounds) map.fitBounds(mapBounds)
  }, [map, mapBounds])

  useEffect(() => {
    let isInitializing = true

    const updateBounds = () => {
      const bounds = map.getBounds()
      const southWest = bounds.getSouthWest()
      const northEast = bounds.getNorthEast()
      setMapViewportBounds({
        swLat: southWest.lat,
        swLng: southWest.lng,
        neLat: northEast.lat,
        neLng: northEast.lng,
      })
    }

    const saveCenterAndZoom = () => {
      if (isInitializing) return

      const center = map.getCenter()
      const zoom = map.getZoom()
      // Save to atoms (which persist to localStorage via atomWithStorage)
      setMapCenter([center.lat, center.lng])
      setMapZoom(zoom)
    }

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
        isInitializing = false
      }, 500)
    })

    updateBounds()

    // Set up event listeners to save on user interaction
    map.on('move', updateBounds)
    map.on('zoom', updateBounds)
    map.on('moveend', () => {
      updateBounds()
      saveCenterAndZoom()
    })
    map.on('zoomend', () => {
      updateBounds()
      saveCenterAndZoom()
    })

    return () => {
      map.off('move', updateBounds)
      map.off('zoom', updateBounds)
      map.off('moveend')
      map.off('zoomend')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, setMapViewportBounds, setMapCenter, setMapZoom])

  return null
}
