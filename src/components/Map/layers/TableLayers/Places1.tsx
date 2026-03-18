import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'

import { TableLayer } from './TableLayer.tsx'
import type Places from '../../../../models/public/Places.ts'

export const Places1 = ({ layerPresentation }) => {
  const { pathname } = useLocation()
  const pathParts = pathname.split('/')
  const placesIdx = pathParts.indexOf('places')
  const placeId = placesIdx !== -1 ? pathParts[placesIdx + 1] : undefined
  // TODO: query only inside current map bounds using places.bbox
  const res = useLiveQuery(
    `SELECT place_id, account_id, subproject_id, parent_id, level, since, until, data,
      ST_AsGeoJSON(geometry)::json as geometry, bbox, label, created_at, updated_at, updated_by
    FROM places WHERE parent_id IS NULL AND geometry IS NOT NULL`,
  )
  const places: Places[] = res?.rows ?? []

  // geometry is returned as GeometryCollection JSON via ST_AsGeoJSON; convert to FeatureCollection for display
  // properties need to go into every feature
  const data = places.map((p) => {
    // add p's properties to all features:
    // TODO: make properties more readable for user
    // Idea: use iframe to open form, see TableLayer
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

  if (!data?.length) return null
  if (!layerPresentation) return null

  return (
    <TableLayer
      data={data}
      layerPresentation={layerPresentation}
      activeId={placeId}
      activeIdField="place_id"
    />
  )
}
