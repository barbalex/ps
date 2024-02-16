import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layers as VectorLayer,
  Actions as Action,
  Places as Place,
} from '../../../generated/client'
import { TableLayer } from './TableLayer'

type Props = {
  layer: VectorLayer
}

type placesResults = {
  results: Place[]
}

type actionsResults = {
  results: Action[]
}

export const Actions2 = ({ layer }: Props) => {
  const { db } = useElectric()!

  // need to query places1 because filtering by places in checks query does not work
  const { results: places2 = [] }: placesResults = useLiveQuery(
    db.places.liveMany({ where: { parent_id: { not: null } } }),
  )

  // TODO: query only inside current map bounds using places.bbox
  const { results: actions = [] }: actionsResults = useLiveQuery(
    db.actions.liveMany({
      where: {
        // places: { parent_id: null }, // this returns no results
        place_id: { in: places2.map((p) => p.place_id) },
        geometry: { not: null },
      },
    }),
  )
  // console.log('hello Actions2, checks:', checks)

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
  // console.log('hello Actions2, data:', data)

  if (!data?.length) return null
  if (!layer) return null

  return <TableLayer data={data} layer={layer} />
}
