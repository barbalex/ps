import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layers as VectorLayer,
  Places as Place,
} from '../../../generated/client'
import { TableLayer } from './TableLayer'

type Props = {
  layer: VectorLayer
}

type placesResults = {
  results: Place[]
}

export const Places2 = ({ layer }: Props) => {
  const { db } = useElectric()!

  // TODO: query only inside current map bounds using places.bbox
  const { results: places = [] }: placesResults = useLiveQuery(
    db.places.liveMany({
      where: { parent_id: { not: null }, geometry: { not: null } },
    }),
  )

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = places.map((p) => {
    // add p's properties to all features:
    // somehow there is a data property with empty object as value???
    // TODO: make properties more readable for user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry, bbox, data, ...placeProperties } = p
    geometry.features.forEach((f) => {
      f.properties = placeProperties ?? {}
    })

    return geometry
  })
  // console.log('hello Places2, data:', data)

  if (!data?.length) return null
  if (!layer) return null

  return <TableLayer data={data} type={layer} />
}
