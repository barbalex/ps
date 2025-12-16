import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useAtomValue } from 'jotai'

import { mapBoundsAtom } from '../../store.ts'

// Problem: when setting bounds from a form query, map is not available
// Solution: use BoundsListener to set bounds from here where map is available
export const BoundsListener = () => {
  const mapBounds = useAtomValue(mapBoundsAtom)
  const map = useMap()

  useEffect(() => {
    if (mapBounds) map.fitBounds(mapBounds)
  }, [map, mapBounds])

  return null
}
