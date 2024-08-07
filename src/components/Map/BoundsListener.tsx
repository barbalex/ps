import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'

// Problem: when setting bounds from a form query, map is not available
// Solution: use BoundsListener to set bounds from here where map is available
export const BoundsListener = () => {
  const map = useMap()

  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapBounds = appState?.map_bounds

  useEffect(() => {
    if (mapBounds) {
      map.fitBounds(mapBounds)
    }
  }, [map, mapBounds])

  return null
}
