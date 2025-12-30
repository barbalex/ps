import { useLiveQuery } from '@electric-sql/pglite-react'

import { TableLayer } from './TableLayer.tsx'
import type Places from '../../../../models/public/Places.ts'

export const Places1 = ({ layerPresentation }) => {
  // TODO: query only inside current map bounds using places.bbox
  const res = useLiveQuery(
    `SELECT * FROM places WHERE parent_id IS NULL AND geometry IS NOT NULL`,
  )
  const places: Places[] = res?.rows ?? []

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = places.map((p) => {
    // add p's properties to all features:
    // TODO: make properties more readable for user
    // Idea: use iframe to open form, see TableLayer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry, bbox, data, ...properties } = p
    geometry.features.forEach((f) => {
      f.properties = properties ?? {}
      // data is _not_ passed under the data property due to errors created
      for (const [key, value] of Object.entries(data)) {
        // ensure that properties are not overwritten
        // but also make sure if key is used for styling, it is not changed...
        if (key in properties) {
          f.properties[`_${key}`] = properties[key]
        }
        f.properties[key] = value
      }
    })

    return geometry
  })

  if (!data?.length) return null
  if (!layerPresentation) return null

  return <TableLayer data={data} layerPresentation={layerPresentation} />
}
