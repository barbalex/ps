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

export const Places1 = ({ layer }: Props) => {
  const { db } = useElectric()!

  // TODO: query only inside current map bounds using places.bbox
  const { results: places = [] }: placesResults = useLiveQuery(
    db.places.liveMany({ where: { parent_id: null, geometry: { not: null } } }),
  )

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = places.map((p) => {
    // add p's properties to all features:
    // TODO: make properties more readable for user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry: geom, bbox, data, ...placeProperties } = p
    const geometry = { ...geom }
    geometry.features.forEach((f) => {
      f.properties = placeProperties ?? {}
      // data is _not_ passed under the data property due to errors created
      for (const [key, value] of Object.entries(data)) {
        // ensure that properties are not overwritten
        // but also make sure if key is used for styling, it is not changed...
        if (key in placeProperties) {
          f.properties[`_${key}`] = placeProperties[key]
        }
        f.properties[key] = value
      }
    })

    return p.geometry
  })
  // console.log('hello Places1, data:', data)

  if (!data?.length) return null
  if (!layer) return null

  return <TableLayer data={data} layer={layer} />
}
