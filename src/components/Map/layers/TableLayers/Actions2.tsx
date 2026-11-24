import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useParams } from '@tanstack/react-router'

import { TableLayer } from './TableLayer.tsx'
import type { TableLayerProps } from './TableLayer.tsx'
import {
  useViewportEnvelope,
  viewportParams,
  viewportPredicate,
} from '../viewportEnvelope.ts'
import type { GeoJsonProperties, GeometryCollection } from 'geojson'
import type Actions from '../../../../models/public/Actions.ts'

export const Actions2 = ({
  layerPresentation,
}: {
  layerPresentation: TableLayerProps['layerPresentation']
}) => {
  const { pathname } = useLocation()
  const pathParts = pathname.split('/')
  const actionsIdx = pathParts.indexOf('actions')
  const actionId = actionsIdx !== -1 ? pathParts[actionsIdx + 1] : undefined
  const { subprojectId } = useParams({ strict: false })
  const envelope = useViewportEnvelope()
  const res = useLiveQuery<Actions & { edit_version: string | null }>(
    `
    SELECT actions.action_id, actions.place_id, actions.date, actions.data,
      ST_AsGeoJSON(actions.geometry)::json as geometry, actions.bbox, actions.relevant_for_reports,
      actions.label, actions.created_at, actions.updated_at, actions.updated_by,
      (SELECT max(t.updated_at) FROM actions t
        INNER JOIN places tp ON t.place_id = tp.place_id
        WHERE tp.parent_id IS NOT NULL AND tp.subproject_id = $1 AND t.geometry IS NOT NULL) AS edit_version
    FROM actions
      INNER JOIN places ON actions.place_id = places.place_id
    WHERE
      actions.geometry IS NOT NULL
      AND places.parent_id IS NOT NULL
      AND places.subproject_id = $1${viewportPredicate('actions.geometry')}
  `,
    [subprojectId, ...viewportParams(envelope)],
  )
  // console.log('hello Actions2, checks:', checks)

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  // memoized on the live-query result: re-renders (the zoomend viewport
  // round-trip through the url) must not rebuild the FeatureCollections —
  // a new data identity reconciles the whole layer
  const data = useMemo(() => {
    const actions = res?.rows ?? []
    return actions.map((p) => {
      // add p's properties to all features:
      // somehow there is a data property with empty object as value???
      // TODO: make properties more readable for user

      const { geometry, bbox, data, edit_version, ...properties } = p
      const fc = {
        type: 'FeatureCollection' as const,
        features: (
          (geometry as GeometryCollection | null)?.geometries ?? []
        ).map((g) => ({
          type: 'Feature' as const,
          geometry: g,
          properties: {} as GeoJsonProperties,
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
              f.properties[`_${key}`] =
                properties[key as keyof typeof properties]
            }
            f.properties[key] = value
          }
        }
      })

      return fc
    })
  }, [res?.rows])
  // console.log('hello Actions2, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return (
    <TableLayer
      data={data}
      editVersion={res?.rows?.[0]?.edit_version ?? null}
      layerPresentation={layerPresentation}
      activeId={actionId}
      activeIdField="action_id"
    />
  )
}
