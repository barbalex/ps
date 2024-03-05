import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../SqlInitializer'

// Problem: when setting bounds from a form query, map is not available
// Solution: use BoundsListener to set bounds from here where map is available
export const BoundsListener = () => {
  const map = useMap()

  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const mapBounds = uiOption?.map_bounds

  useEffect(() => {
    if (mapBounds) {
      map.fitBounds(mapBounds)
    }
  }, [map, mapBounds])

  return null
}
