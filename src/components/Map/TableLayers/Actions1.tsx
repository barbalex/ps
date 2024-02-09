import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layer_displays as VectorLayerDisplay,
  Actions as Action,
  Places as Place,
} from '../../../generated/client'
import { TableLayer } from './TableLayer'

type Props = {
  display: VectorLayerDisplay
}

export const Actions1 = ({ display }: Props) => {
  const { db } = useElectric()!

  // need to query places1 because filtering by places in checks query does not work
  const { results: places1Results = [] } = useLiveQuery(
    db.places.liveMany({ where: { parent_id: null } }),
  )
  const places1: Place[] = places1Results

  // TODO: query only inside current map bounds using places.bbox
  const { results = [] } = useLiveQuery(
    db.actions.liveMany({
      where: {
        // places: { parent_id: null }, // this returns no results
        place_id: { in: places1.map((p) => p.place_id) },
        geometry: { not: null },
      },
    }),
  )
  const actions: Action[] = results
  // console.log('hello Actions1, checks:', checks)

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = actions.map((p) => {
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
  // console.log('hello Actions1, data:', data)

  if (!data?.length) return null
  if (!display) return null

  return <TableLayer data={data} display={display} />
}
