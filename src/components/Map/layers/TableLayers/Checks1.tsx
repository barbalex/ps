import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'

import { TableLayer } from './TableLayer.tsx'
import type Checks from '../../../../models/public/Checks.ts'

export const Checks1 = ({ layerPresentation }) => {
  const { pathname } = useLocation()
  const pathParts = pathname.split('/')
  const checksIdx = pathParts.indexOf('checks')
  const checkId = checksIdx !== -1 ? pathParts[checksIdx + 1] : undefined
  // TODO: query only inside current map bounds using places.bbox
  const res = useLiveQuery(
    `
    SELECT checks.check_id, checks.account_id, checks.place_id, checks.date, checks.data,
      ST_AsGeoJSON(checks.geometry)::json as geometry, checks.bbox, checks.relevant_for_reports,
      checks.label, checks.created_at, checks.updated_at, checks.updated_by
    FROM checks
      INNER JOIN places ON checks.place_id = places.place_id
    WHERE 
      checks.geometry IS NOT NULL
      AND places.parent_id IS NULL
  `,
  )
  const checks: Checks[] = res?.rows ?? []

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  const data = checks.map((p) => {
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
      if (data) {
        // data is _not_ passed under the data property due to errors created
      for (const [key, value] of Object.entries(data ?? {})) {
        // ensure that properties are not overwritten
        // but also make sure if key is used for styling, it is not changed...
        if (key in properties) {
          f.properties[`_${key}`] = properties[key]
        }
        f.properties[key] = value
        }
      }
    })

    return fc
  })
  // console.log('hello Checks1, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return <TableLayer data={data} layerPresentation={layerPresentation} activeId={checkId} activeIdField="check_id" />
}
