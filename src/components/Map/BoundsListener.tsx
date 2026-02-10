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
      setMapViewportBounds({
        southWest: bounds.getSouthWest(),
        northEast: bounds.getNorthEast(),
      })
    }

    updateBounds()
    map.on('moveend', updateBounds)
    map.on('zoomend', updateBounds)

    return () => {
      map.off('moveend', updateBounds)
      map.off('zoomend', updateBounds)
    }
  }, [map, setMapViewportBounds])

  return null
}
