import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layer_displays as VectorLayerDisplay,
  Checks as Check,
} from '../../../generated/client'
import { TableLayer } from './TableLayer'

type Props = {
  display: VectorLayerDisplay
}

export const Checks1 = ({ display }: Props) => {
  const { db } = useElectric()!

  // TODO: query only inside current map bounds using places.bbox
  const { results = [] } = useLiveQuery(
    db.checks.liveMany({
      where: { geometry: { not: null } },
    }),
  )
  const checks: Check[] = results

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
  console.log('hello Checks1, data:', data)

  if (!data?.length) return null
  if (!display) return null

  return <TableLayer data={data} display={display} />
}
