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
import type Checks from '../../../../models/public/Checks.ts'

export const Checks2 = ({
  layerPresentation,
}: {
  layerPresentation: TableLayerProps['layerPresentation']
}) => {
  const { pathname } = useLocation()
  const pathParts = pathname.split('/')
  const checksIdx = pathParts.indexOf('checks')
  const checkId = checksIdx !== -1 ? pathParts[checksIdx + 1] : undefined
  const { subprojectId } = useParams({ strict: false })
  const envelope = useViewportEnvelope()
  const res = useLiveQuery<Checks & { edit_version: string | null }>(
    `
    SELECT checks.check_id, checks.place_id, checks.date, checks.data,
      ST_AsGeoJSON(checks.geometry)::json as geometry, checks.bbox, checks.relevant_for_reports,
      checks.label, checks.created_at, checks.updated_at, checks.updated_by,
      (SELECT max(t.updated_at) FROM checks t
        INNER JOIN places tp ON t.place_id = tp.place_id
        WHERE tp.parent_id IS NOT NULL AND tp.subproject_id = $1 AND t.geometry IS NOT NULL) AS edit_version
    FROM checks
      INNER JOIN places ON checks.place_id = places.place_id
    WHERE
      checks.geometry IS NOT NULL
      AND places.parent_id IS NOT NULL
      AND places.subproject_id = $1${viewportPredicate('checks.geometry')}`,
    [subprojectId, ...viewportParams(envelope)],
  )
  // console.log('hello Checks1, checks:', checks)

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  // memoized on the live-query result: re-renders (the zoomend viewport
  // round-trip through the url) must not rebuild the FeatureCollections —
  // a new data identity reconciles the whole layer
  const data = useMemo(() => {
    const checks = res?.rows ?? []
    return checks.map((p) => {
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
  // console.log('hello Checks2, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return (
    <TableLayer
      data={data}
      editVersion={res?.rows?.[0]?.edit_version ?? null}
      layerPresentation={layerPresentation}
      activeId={checkId}
      activeIdField="check_id"
    />
  )
}
