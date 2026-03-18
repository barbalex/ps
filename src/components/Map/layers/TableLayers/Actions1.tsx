import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'

import { TableLayer } from './TableLayer.tsx'
import type Actions from '../../../../models/public/Actions.ts'

export const Actions1 = ({ layerPresentation }) => {
  const { pathname } = useLocation()
  const pathParts = pathname.split('/')
  const actionsIdx = pathParts.indexOf('actions')
  const actionId = actionsIdx !== -1 ? pathParts[actionsIdx + 1] : undefined
  // TODO: query only inside current map bounds using places.bbox
  const resActions = useLiveQuery(
    `
    SELECT actions.action_id, actions.account_id, actions.place_id, actions.date, actions.data,
      ST_AsGeoJSON(actions.geometry)::json as geometry, actions.bbox, actions.relevant_for_reports,
      actions.label, actions.created_at, actions.updated_at, actions.updated_by
    FROM actions
      INNER JOIN places ON actions.place_id = places.place_id
    WHERE 
      actions.geometry IS NOT NULL 
      AND places.parent_id IS NULL`,
    undefined,
  )
  const actions: Actions[] = resActions?.rows ?? []
  // console.log('hello Actions1, checks:', checks)

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  const data = actions.map((p) => {
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
      for (const [key, value] of Object.entries(data)) {
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
  // console.log('hello Actions1, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return <TableLayer data={data} layerPresentation={layerPresentation} activeId={actionId} activeIdField="action_id" />
}
