import { useEffect, useRef, useCallback } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import type { LatLngTuple, ZoomPanOptions } from 'leaflet'
import { useAtomValue, useSetAtom } from 'jotai'

import { mapBoundsAtom, mapViewportBoundsAtom } from '../../store.ts'
import { useUrlMapViewport } from '../../modules/useUrlMapViewport.ts'

// Problem: when setting bounds from a form query, map is not available
// Solution: use BoundsListener to set bounds from here where map is available
export const BoundsListener = () => {
  const mapBounds = useAtomValue(mapBoundsAtom)
  const setMapViewportBounds = useSetAtom(mapViewportBoundsAtom)
  // url params win, localStorage atoms are the fallback (see the hook);
  // panes update the url on moveend, so this view is linkable
  const { center: currentCenter, zoom: currentZoom, saveViewport } =
    useUrlMapViewport()
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
    saveViewport([center.lat, center.lng], zoom)
  }, [map, saveViewport])

  const onMoveEndOrZoomEnd = useCallback(() => {
    onMoveOrZoom()
    saveCenterAndZoom()
  }, [onMoveOrZoom, saveCenterAndZoom])

  // Set up event listeners to save on user interaction.
  // viewport bounds are written on moveend/zoomend only: they are needed by
  // click-time consumers (WFS loading in the layers drawer), and a per-frame
  // `move`/`zoom` write re-rendered every subscriber on each animation frame
  // of a pan
  useMapEvents({
    moveend: onMoveEndOrZoomEnd,
    zoomend: onMoveEndOrZoomEnd,
  })

  useEffect(() => {
    if (mapBounds) map.fitBounds(mapBounds)
  }, [map, mapBounds])

  useEffect(() => {
    isInitializingRef.current = true

    // Restore view from the url (or stored fallback) immediately when the
    // map is ready; re-runs when the url params change, so following a link
    // with other c/z params moves the map
    map.whenReady(() => {
      if (currentCenter && currentZoom) {
        try {
          // Force the view regardless of current state
          // `reset` is a valid leaflet setView option but missing from ZoomPanOptions
          map.setView(currentCenter as LatLngTuple, currentZoom, {
            animate: false,
            reset: true,
          } as ZoomPanOptions)

          // Retry if zoom didn't stick (seems to happen on initial load)
          setTimeout(() => {
            if (map.getZoom() !== currentZoom) {
              map.setZoom(currentZoom, { animate: false })
            }
          }, 50)

          setTimeout(() => {
            if (map.getZoom() !== currentZoom) {
              map.setZoom(currentZoom, { animate: false })
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
    saveViewport,
    currentCenter,
    currentZoom,
    onMoveOrZoom,
  ])

  return null
}
