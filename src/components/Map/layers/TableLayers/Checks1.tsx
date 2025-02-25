import { useLiveQuery } from '@electric-sql/pglite-react'

import { TableLayer } from './TableLayer.tsx'

export const Checks1 = ({ layerPresentation }) => {
  // TODO: query only inside current map bounds using places.bbox
  const res = useLiveQuery(`
    SELECT checks.* 
    FROM checks
      INNER JOIN places ON checks.place_id = places.place_id
    WHERE 
      geometry IS NOT NULL
      AND places.parent_id IS NULL
  `)
  const checks = res?.rows ?? []
  // console.log('hello Checks1, checks:', checks)

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = checks.map((p) => {
    // add p's properties to all features:
    // somehow there is a data property with empty object as value???
    // TODO: make properties more readable for user
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
  // console.log('hello Checks1, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return (
    <TableLayer
      data={data}
      layerPresentation={layerPresentation}
    />
  )
}
