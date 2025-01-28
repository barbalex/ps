import { useLiveQuery } from 'electric-sql/react'
import { usePGlite } from "@electric-sql/pglite-react"

import { Layer_presentations as LayerPresentation } from '../../../../generated/client/index.ts'
import { TableLayer } from './TableLayer.tsx'

interface Props {
  layerPresentation: LayerPresentation
}

export const Checks2 = ({ layerPresentation }: Props) => {
  const db = usePGlite()

  // need to query places1 because filtering by places in checks query does not work
  const { results: places2 = [] } = useLiveQuery(
    db.places.liveMany({ where: { parent_id: { not: null } } }),
  )

  // TODO: query only inside current map bounds using places.bbox
  const { results: checks = [] } = useLiveQuery(
    db.checks.liveMany({
      where: {
        // places: { parent_id: null }, // this returns no results
        place_id: { in: places2.map((p) => p.place_id) },
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
  // console.log('hello Checks2, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return <TableLayer data={data} layerPresentation={layerPresentation} />
}
