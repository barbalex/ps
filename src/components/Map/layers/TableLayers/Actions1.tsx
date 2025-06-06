import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TableLayer } from './TableLayer.tsx'

export const Actions1 = ({ layerPresentation }) => {
  // TODO: query only inside current map bounds using places.bbox
  const resActions = useLiveIncrementalQuery(
    `
    SELECT actions.* 
    FROM actions
      INNER JOIN places ON actions.place_id = places.place_id
    WHERE 
      actions.geometry IS NOT NULL 
      AND places.parent_id IS NULL`,
    undefined,
    'action_id',
  )
  const actions = resActions?.rows ?? []
  // console.log('hello Actions1, checks:', checks)

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = actions.map((p) => {
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
  // console.log('hello Actions1, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return (
    <TableLayer
      data={data}
      layerPresentation={layerPresentation}
    />
  )
}
