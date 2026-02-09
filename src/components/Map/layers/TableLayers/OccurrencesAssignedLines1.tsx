import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { bbox } from '@turf/bbox'
import { featureCollection, lineString } from '@turf/helpers'

import { TableLayer } from './TableLayer.tsx'

const getGeometryCenter = (geometry) => {
  if (!geometry) return null
  try {
    const [minX, minY, maxX, maxY] = bbox(geometry)
    return [(minX + maxX) / 2, (minY + maxY) / 2]
  } catch (error) {
    console.log('OccurrencesAssignedLines1 getGeometryCenter', { error })
    return null
  }
}

export const OccurrencesAssignedLines1 = ({ layerPresentation }) => {
  const { subprojectId } = useParams({ strict: false })

  const res = useLiveQuery(
    `
    SELECT 
      o.occurrence_id,
      o.label as occurrence_label,
      o.geometry as occurrence_geometry,
      p.place_id,
      p.label as place_label,
      p.geometry as place_geometry
    FROM occurrences o
      INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
      INNER JOIN places p ON o.place_id = p.place_id
    WHERE 
      o.geometry IS NOT NULL
      AND p.geometry IS NOT NULL
      AND oi.subproject_id = $1
      AND p.parent_id IS NULL
  `,
    [subprojectId],
  )
  const rows = res?.rows ?? []

  const data = rows.flatMap((row) => {
    const occurrenceCenter = getGeometryCenter(row.occurrence_geometry)
    const placeCenter = getGeometryCenter(row.place_geometry)
    if (!occurrenceCenter || !placeCenter) return []

    const occurrenceLabel = row.occurrence_label ?? row.occurrence_id
    const placeLabel = row.place_label ?? row.place_id

    const feature = lineString([occurrenceCenter, placeCenter], {
      occurrence_id: row.occurrence_id,
      place_id: row.place_id,
      occurrence_label: occurrenceLabel,
      place_label: placeLabel,
      label: `${occurrenceLabel ?? 'Occurrence'} → ${placeLabel ?? 'Place'}`,
    })

    return [featureCollection([feature])]
  })

  if (!data?.length) return null
  if (!layerPresentation) return null

  return <TableLayer data={data} layerPresentation={layerPresentation} />
}
