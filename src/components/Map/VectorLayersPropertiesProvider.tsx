import { memo, useEffect, useState, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { usePrevious } from '@uidotdev/usehooks'

import { useElectric } from '../../ElectricProvider.tsx'

export const VectorLayersPropertiesProvider = memo(() => {
  const { db } = useElectric()!
  const [keys, setKeys] = useState([])
  const previousKeys = usePrevious(keys)

  const {
    results: placesData = [],
    error,
    updatedAt,
  } = useLiveQuery(
    db.places.liveMany({
      select: { data: true },
    }),
  )
  const currentKeys = useMemo(() => [], [])
  for (const place of placesData) {
    currentKeys.push(...Object.keys(place.data))
  }
  const currentUniqueKeys = useMemo(
    () => [...new Set(currentKeys)],
    [currentKeys],
  )
  // console.log('VectorLayersPropertiesProvider', {
  //   placesData,
  //   error,
  //   updatedAt,
  //   keys,
  //   uniqueKeys,
  // })
  console.log('VectorLayersPropertiesProvider, keys:', currentUniqueKeys)
  // when a key inside places.data changes, update vector_layers.properties:
  // set it as an array of places.data's keys
  useEffect(() => {
    if (!currentUniqueKeys.length) return
    if (currentUniqueKeys === previousKeys) return
    setKeys(currentUniqueKeys)
    console.log('VectorLayersPropertiesProvider.useEffect, got data')
  }, [currentUniqueKeys, currentUniqueKeys.length, previousKeys])

  return null
})
