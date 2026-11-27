import { useMemo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useOwnLayerScope } from '../../../../modules/useOwnLayerScope.ts'
import { useAtomValue } from 'jotai'

import { TableLayer } from './TableLayer.tsx'
import type { TableLayerProps } from './TableLayer.tsx'
import { useActiveObservationId } from './useActiveObservationId.ts'
import {
  useViewportEnvelope,
  viewportParams,
  viewportPredicate,
} from '../viewportEnvelope.ts'
import type { GeoJsonProperties, GeometryCollection } from 'geojson'
import { draggableLayersAtom } from '../../../../store.ts'
import type Observations from '../../../../models/public/Observations.ts'

// the live query's row: the model plus the viewport bbox and edit_version
type ObservationRow = Observations & {
  bbox?: unknown
  edit_version: string | null
}

export const ObservationsNotToAssign = ({
  layerPresentation,
}: {
  layerPresentation: TableLayerProps['layerPresentation']
}) => {
  const draggableLayers = useAtomValue(draggableLayersAtom)
  const { scopeFilter, scopeId, areaFilter } = useOwnLayerScope()
  const activeObservationId = useActiveObservationId()
  const envelope = useViewportEnvelope()
  const res = useLiveQuery<ObservationRow>(
    `
    SELECT o.observation_id, o.observation_import_id, o.place_id, o.not_to_assign, o.absence,
      o.comment, o.data, o.id_in_source, ST_AsGeoJSON(o.geometry)::json as geometry,
      o.label, o.created_at, o.updated_at, o.updated_by,
      (SELECT max(t.updated_at) FROM observations t
        INNER JOIN observation_imports ti ON t.observation_import_id = ti.observation_import_id
        WHERE ti.subproject_id ${scopeFilter} AND t.place_id IS NULL
          AND t.not_to_assign = true AND t.geometry IS NOT NULL) AS edit_version
    FROM observations o
      INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
    WHERE
      oi.subproject_id ${scopeFilter}
      AND o.place_id IS NULL
      AND o.not_to_assign = true
      AND o.geometry IS NOT NULL${areaFilter('o')}${viewportPredicate('o.geometry')}
  `,
    [scopeId, ...viewportParams(envelope)],
  )

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  // memoized on the live-query result: re-renders (the zoomend viewport
  // round-trip through the url) must not rebuild the FeatureCollections —
  // a new data identity reconciles the whole layer
  const data = useMemo(() => {
    const observations: ObservationRow[] = res?.rows ?? []
    return observations.map((p: ObservationRow) => {
      // add p's properties to all features:
      // TODO: make properties more readable for user
      // Idea: use iframe to open form, see TableLayer

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
      // row columns apply even when the data jsonb is empty (e.g. absence)
      fc.features.forEach((f) => {
        f.properties = properties ?? {}
      })
      if (!data) return fc
      fc.features.forEach((f) => {
        f.properties = f.properties ?? {}
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

  if (!data?.length) return null
  if (!layerPresentation) return null

  const layer = layerPresentation.vector_layers
  const isDraggable = draggableLayers?.includes?.(layer?.name as string)

  // popups pop on mouseup (=dragend)
  // so they should not be bound when draggable or they will pop on dragend
  // thus adding key={isDraggable} to re-render when draggable changes
  return (
    <TableLayer
      key={isDraggable as unknown as string}
      data={data}
      editVersion={res?.rows?.[0]?.edit_version ?? null}
      layerPresentation={layerPresentation}
      activeId={activeObservationId}
      activeIdField="observation_id"
    />
  )
}
