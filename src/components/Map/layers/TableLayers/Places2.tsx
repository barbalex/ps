import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { TableLayer } from './TableLayer.tsx'
import type Places from '../../../../models/public/Places.ts'

export const Places2 = ({ layerPresentation }) => {
  const { placeId2 } = useParams({ strict: false })
  // TODO: query only inside current map bounds using places.bbox
  const res = useLiveQuery(
    `SELECT place_id, account_id, subproject_id, parent_id, level, since, until, data,
      ST_AsGeoJSON(geometry)::json as geometry, bbox, label, created_at, updated_at, updated_by
    FROM places WHERE parent_id IS NOT NULL AND geometry IS NOT NULL`,
  )
  const places: Places[] = res?.rows ?? []

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  const data = places.map((p) => {
    // add p's properties to all features:
    // somehow there is a data property with empty object as value???
    // TODO: make properties more readable for user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry, bbox, data, ...properties } = p
    const fc = {
      type: 'FeatureCollection',
      features: (geometry?.geometries ?? []).map((g) => ({
        type: 'Feature',
        geometry: g,
        properties: {},
      })),
    }
    fc.features.forEach((f) => {
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

    return fc
  })
  // console.log('hello Places2, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return <TableLayer data={data} layerPresentation={layerPresentation} activeId={placeId2} activeIdField="place_id" />
}
