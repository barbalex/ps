import { useMemo } from 'react'
import { useOwnLayerScope } from '../../../../modules/useOwnLayerScope.ts'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { featureCollection, lineString } from '@turf/helpers'

import { TableLayer } from './TableLayer.tsx'
import type { TableLayerProps } from './TableLayer.tsx'
import { useActiveObservationId } from './useActiveObservationId.ts'
import {
  useViewportEnvelope,
  viewportEitherPredicate,
  viewportParams,
} from '../viewportEnvelope.ts'

type AssignmentRow = {
  observation_id: string
  observation_label: string | null
  observation_center: { type: string; coordinates: number[] } | null
  place_id: string
  place_label: string | null
  place_center: { type: string; coordinates: number[] } | null
  edit_version: string | null
}

// center of the geometry's bounding box, calculated by PostGIS
const centerCoordinates = (
  center: AssignmentRow['observation_center'],
): [number, number] | null => {
  if (center?.type !== 'Point' || !Array.isArray(center.coordinates)) {
    return null
  }
  const [lng, lat] = center.coordinates
  if (typeof lng !== 'number' || typeof lat !== 'number') return null
  return [lng, lat]
}

export const ObservationsAssignedLines1 = ({
  layerPresentation,
}: {
  layerPresentation: TableLayerProps['layerPresentation']
}) => {
  const { scopeFilter, scopeId } = useOwnLayerScope()
  const activeObservationId = useActiveObservationId()
  const envelope = useViewportEnvelope()

  const res = useLiveQuery(
    `
    SELECT
      o.observation_id,
      o.label as observation_label,
      ST_AsGeoJSON(ST_Centroid(ST_Envelope(o.geometry)))::json as observation_center,
      p.place_id,
      p.label as place_label,
      ST_AsGeoJSON(ST_Centroid(ST_Envelope(p.geometry)))::json as place_center,
      GREATEST(
        (SELECT max(t.updated_at) FROM observations t
          INNER JOIN observation_imports ti ON t.observation_import_id = ti.observation_import_id
          WHERE ti.subproject_id ${scopeFilter}),
        (SELECT max(tp.updated_at) FROM places tp
          JOIN observations t ON t.place_id = tp.place_id
          JOIN observation_imports ti ON ti.observation_import_id = t.observation_import_id
          WHERE ti.subproject_id ${scopeFilter} AND tp.parent_id IS NULL)
      ) AS edit_version
    FROM observations o
      INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
      INNER JOIN places p ON o.place_id = p.place_id
    WHERE
      o.geometry IS NOT NULL
      AND p.geometry IS NOT NULL
      AND oi.subproject_id ${scopeFilter}
      AND p.parent_id IS NULL${viewportEitherPredicate('o.geometry', 'p.geometry')}
  `,
    [scopeId, ...viewportParams(envelope)],
  )

  // memoized on the live-query result: re-renders (the zoomend viewport
  // round-trip through the url) must not rebuild the FeatureCollections —
  // a new data identity reconciles the whole layer
  const data = useMemo(() => {
    const rows = (res?.rows ?? []) as AssignmentRow[]
    return rows.flatMap((row) => {
      const observationCenter = centerCoordinates(row.observation_center)
      const placeCenter = centerCoordinates(row.place_center)
      if (!observationCenter || !placeCenter) return []

      const observationLabel = row.observation_label ?? row.observation_id
      const placeLabel = row.place_label ?? row.place_id

      const feature = lineString([observationCenter, placeCenter], {
        observation_id: row.observation_id,
        place_id: row.place_id,
        observation_label: observationLabel,
        place_label: placeLabel,
        label: `${observationLabel ?? 'Observation'} → ${placeLabel ?? 'Place'}`,
      })

      return [featureCollection([feature])]
    })
  }, [res?.rows])

  if (!data?.length) return null
  if (!layerPresentation) return null

  return (
    <TableLayer
      data={data}
      editVersion={
        (res?.rows?.[0] as AssignmentRow | undefined)?.edit_version ?? null
      }
      layerPresentation={layerPresentation}
      activeId={activeObservationId}
      activeIdField="observation_id"
    />
  )
}
