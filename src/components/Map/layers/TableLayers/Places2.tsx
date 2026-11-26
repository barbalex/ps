import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { useOwnLayerScope } from '../../../../modules/useOwnLayerScope.ts'

import { TableLayer } from './TableLayer.tsx'
import type { TableLayerProps } from './TableLayer.tsx'
import {
  useViewportEnvelope,
  viewportParams,
  viewportPredicate,
} from '../viewportEnvelope.ts'
import type { GeoJsonProperties, GeometryCollection } from 'geojson'
import type Places from '../../../../models/public/Places.ts'

export const Places2 = ({
  layerPresentation,
}: {
  layerPresentation: TableLayerProps['layerPresentation']
}) => {
  const { pathname } = useLocation()
  const pathParts = pathname.split('/')
  // placeId2 is the second /places/{id} segment in the URL
  const firstPlacesIdx = pathParts.indexOf('places')
  const secondPlacesIdx =
    firstPlacesIdx !== -1 ? pathParts.indexOf('places', firstPlacesIdx + 1) : -1
  const placeId2 =
    secondPlacesIdx !== -1 ? pathParts[secondPlacesIdx + 1] : undefined
  const { scopeFilter, scopeId } = useOwnLayerScope()
  const envelope = useViewportEnvelope()
  const res = useLiveQuery<Places & { edit_version: string | null }>(
    `SELECT place_id, subproject_id, parent_id, level, since, until, data,
      ST_AsGeoJSON(geometry)::json as geometry, bbox, relevant_for_reports, label, created_at, updated_at, updated_by,
      (SELECT max(t.updated_at) FROM places t
        WHERE t.parent_id IS NOT NULL AND t.subproject_id ${scopeFilter} AND t.geometry IS NOT NULL) AS edit_version
    FROM places WHERE parent_id IS NOT NULL AND subproject_id ${scopeFilter} AND geometry IS NOT NULL${viewportPredicate('places.geometry')}`,
    [scopeId, ...viewportParams(envelope)],
  )

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  // memoized on the live-query result: re-renders (the zoomend viewport
  // round-trip through the url) must not rebuild the FeatureCollections —
  // a new data identity reconciles the whole layer
  const data = useMemo(() => {
    const places = res?.rows ?? []
    return places.map((p) => {
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
        // data is _not_ passed under the data property due to errors created
        for (const [key, value] of Object.entries(data ?? {})) {
          // ensure that properties are not overwritten
          // but also make sure if key is used for styling, it is not changed...
          if (key in properties) {
            f.properties[`_${key}`] = properties[key as keyof typeof properties]
          }
          f.properties[key] = value
        }
      })

      return fc
    })
  }, [res?.rows])
  // console.log('hello Places2, data:', data)

  if (!data?.length) return null
  if (!layerPresentation) return null

  return (
    <TableLayer
      data={data}
      editVersion={res?.rows?.[0]?.edit_version ?? null}
      layerPresentation={layerPresentation}
      activeId={placeId2}
      activeIdField="place_id"
    />
  )
}
