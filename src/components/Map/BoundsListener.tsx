import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useAtomValue, useSetAtom } from 'jotai'

import { mapBoundsAtom, mapViewportBoundsAtom } from '../../store.ts'

// Problem: when setting bounds from a form query, map is not available
// Solution: use BoundsListener to set bounds from here where map is available
export const BoundsListener = () => {
  const mapBounds = useAtomValue(mapBoundsAtom)
  const setMapViewportBounds = useSetAtom(mapViewportBoundsAtom)
  const map = useMap()

  useEffect(() => {
    if (mapBounds) map.fitBounds(mapBounds)
  }, [map, mapBounds])

  useEffect(() => {
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

    updateBounds()
    map.on('move', updateBounds)
    map.on('zoom', updateBounds)
    map.on('moveend', updateBounds)
    map.on('zoomend', updateBounds)

    return () => {
      map.off('move', updateBounds)
      map.off('zoom', updateBounds)
      map.off('moveend', updateBounds)
      map.off('zoomend', updateBounds)
    }
  }, [map, setMapViewportBounds])

  return null
}
