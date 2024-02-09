import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import {
  Vector_layer_displays as VectorLayerDisplay,
  Places as Place,
} from '../../../generated/client'
import { TableLayer } from './TableLayer'

type Props = {
  display: VectorLayerDisplay
}

// TODO: query ui_options.show_place1_layer in parent
// and render this component accordingly to prevent querying all places here
export const Places1Layer = ({ display }: Props) => {
  const { db } = useElectric()!

  // TODO: query only inside current map bounds using places.bbox
  const { results: placesResults = [] } = useLiveQuery(
    db.places.liveMany({ where: { parent_id: null, geometry: { not: null } } }),
  )
  const places: Place[] = placesResults

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = places.map((p) => {
    // add p's properties to all features:
    // somehow there is a data property with empty object as value???
    // TODO: make properties more readable for user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry: geom, bbox, data, ...placeProperties } = p
    const geometry = { ...p.geometry }
    geometry.features.forEach((f) => {
      f.properties = placeProperties ?? {}
    })
    return p.geometry
  })
  console.log('hello Places1Layer, data:', data)

  return <TableLayer data={data} display={display} />
}
