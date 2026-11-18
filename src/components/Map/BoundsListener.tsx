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

  // Latest callbacks behind refs: the restore effect below must re-run
  // only when the url's c/z values actually change. Re-running on a
  // fresh saveViewport identity (every re-render) raced the router's
  // async search commit: right after a zoomend the effect still saw the
  // OLD url params, decided the view was not current and setView'd with
  // reset back to the old view — then the commit arrived and the effect
  // jumped forward again: the map visibly flicked away and back on
  // every zoom end
  const saveViewportRef = useRef(saveViewport)
  saveViewportRef.current = saveViewport
  const onMoveOrZoomRef = useRef(onMoveOrZoom)
  onMoveOrZoomRef.current = onMoveOrZoom

  const saveCenterAndZoom = useCallback(() => {
    if (isInitializingRef.current) return

    const center = map.getCenter()
    const zoom = map.getZoom()
    saveViewportRef.current([center.lat, center.lng], zoom)
  }, [map])

  const onMoveEndOrZoomEnd = useCallback(() => {
    onMoveOrZoomRef.current()
    saveCenterAndZoom()
  }, [saveCenterAndZoom])

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
          // Skip redundant restores: every moveend/zoomend round-trips the
          // current view through the url, which re-runs this effect — a
          // setView with reset on the unchanged view tears the tile layers
          // down and repaints them, a visible flicker on zoom end
          const c = map.getCenter()
          const viewIsCurrent =
            Math.abs(c.lat - currentCenter[0]) < 1e-5 &&
            Math.abs(c.lng - currentCenter[1]) < 1e-5 &&
            map.getZoom() === currentZoom

          if (!viewIsCurrent) {
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
          }
        } catch (e) {
          console.error('Failed to restore map view:', e)
        }
      }

      // Mark initialization as complete after enough time
      setTimeout(() => {
        isInitializingRef.current = false
      }, 500)
    })

    onMoveOrZoomRef.current()
  }, [map, currentCenter, currentZoom])

  return null
}
