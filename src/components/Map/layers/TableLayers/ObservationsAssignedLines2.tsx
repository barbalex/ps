import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { featureCollection, lineString } from '@turf/helpers'

import { TableLayer } from './TableLayer.tsx'
import type { TableLayerProps } from './TableLayer.tsx'

type AssignmentRow = {
  observation_id: string
  observation_label: string | null
  observation_center: { type: string; coordinates: number[] } | null
  place_id: string
  place_label: string | null
  place_center: { type: string; coordinates: number[] } | null
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

export const ObservationsAssignedLines2 = ({
  layerPresentation,
}: {
  layerPresentation: TableLayerProps['layerPresentation']
}) => {
  const { subprojectId } = useParams({ strict: false })

  const res = useLiveQuery(
    `
    SELECT
      o.observation_id,
      o.label as observation_label,
      ST_AsGeoJSON(ST_Centroid(ST_Envelope(o.geometry)))::json as observation_center,
      p.place_id,
      p.label as place_label,
      ST_AsGeoJSON(ST_Centroid(ST_Envelope(p.geometry)))::json as place_center
    FROM observations o
      INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
      INNER JOIN places p ON o.place_id = p.place_id
    WHERE
      o.geometry IS NOT NULL
      AND p.geometry IS NOT NULL
      AND oi.subproject_id = $1
      AND p.parent_id IS NOT NULL
  `,
    [subprojectId],
  )
  const rows = (res?.rows ?? []) as AssignmentRow[]

  const data = rows.flatMap((row) => {
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

  if (!data?.length) return null
  if (!layerPresentation) return null

  return <TableLayer data={data} layerPresentation={layerPresentation} />
}
