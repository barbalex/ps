import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layer_displays as VectorLayerDisplay,
  Checks as Check,
  Places as Place,
} from '../../../generated/client'
import { TableLayer } from './TableLayer'

type Props = {
  display: VectorLayerDisplay
}

export const Checks2 = ({ display }: Props) => {
  const { db } = useElectric()!

  // need to query places1 because filtering by places in checks query does not work
  const { results: places2Results = [] } = useLiveQuery(
    db.places.liveMany({ where: { parent_id: { not: null } } }),
  )
  const places2: Place[] = places2Results

  // TODO: query only inside current map bounds using places.bbox
  const { results = [] } = useLiveQuery(
    db.checks.liveMany({
      where: {
        // places: { parent_id: null }, // this returns no results
        place_id: { in: places2.map((p) => p.place_id) },
        geometry: { not: null },
      },
    }),
  )
  const checks: Check[] = results
  // console.log('hello Checks1, checks:', checks)

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = checks.map((p) => {
    // add p's properties to all features:
    // somehow there is a data property with empty object as value???
    // TODO: make properties more readable for user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry: geom, bbox, data, ...otherProperties } = p
    const geometry = { ...p.geometry }
    geometry.features.forEach((f) => {
      f.properties = otherProperties ?? {}
    })
    return p.geometry
  })
  // console.log('hello Checks2, data:', data)

  if (!data?.length) return null
  if (!display) return null

  return <TableLayer data={data} display={display} />
}
