import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layers as VectorLayer,
  Checks as Check,
  Places as Place,
} from '../../../generated/client'
import { TableLayer } from './TableLayer'

type Props = {
  layer: VectorLayer
}

type placesResults = {
  results: Place[]
}

type checksResults = {
  results: Check[]
}

export const Checks1 = ({ layer }: Props) => {
  const { db } = useElectric()!

  // need to query places1 because filtering by places in checks query does not work
  const { results: places1 = [] }: placesResults = useLiveQuery(
    db.places.liveMany({ where: { parent_id: null } }),
  )

  // TODO: query only inside current map bounds using places.bbox
  const { results: checks = [] }: checksResults = useLiveQuery(
    db.checks.liveMany({
      where: {
        // places: { parent_id: null }, // this returns no results
        place_id: { in: places1.map((p) => p.place_id) },
        geometry: { not: null },
      },
    }),
  )
  // console.log('hello Checks1, checks:', checks)

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = checks.map((p) => {
    // add p's properties to all features:
    // somehow there is a data property with empty object as value???
    // TODO: make properties more readable for user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry, bbox, data, ...otherProperties } = p
    geometry.features.forEach((f) => {
      f.properties = otherProperties ?? {}
    })

    return geometry
  })
  // console.log('hello Checks1, data:', data)

  if (!data?.length) return null
  if (!layer) return null

  return <TableLayer data={data} layer={layer} />
}
