import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { bbox } from '@turf/bbox'
import { featureCollection, lineString } from '@turf/helpers'
import type { AllGeoJSON } from '@turf/helpers'
import type { Geometry } from 'geojson'

import { TableLayer } from './TableLayer.tsx'
import type { TableLayerProps } from './TableLayer.tsx'

type AssignmentRow = {
  observation_id: string
  observation_label: string | null
  observation_geometry: Geometry | null
  place_id: string
  place_label: string | null
  place_geometry: Geometry | null
}

const getGeometryCenter = (geometry: AllGeoJSON | null | undefined) => {
  if (!geometry) return null
  try {
    const [minX, minY, maxX, maxY] = bbox(geometry)
    return [(minX + maxX) / 2, (minY + maxY) / 2]
  } catch (error) {
    console.log('ObservationsAssignedLines1 getGeometryCenter', { error })
    return null
  }
}

export const ObservationsAssignedLines1 = ({
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
      o.geometry as observation_geometry,
      p.place_id,
      p.label as place_label,
      p.geometry as place_geometry
    FROM observations o
      INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
      INNER JOIN places p ON o.place_id = p.place_id
    WHERE 
      o.geometry IS NOT NULL
      AND p.geometry IS NOT NULL
      AND oi.subproject_id = $1
      AND p.parent_id IS NULL
  `,
    [subprojectId],
  )
  const rows = (res?.rows ?? []) as AssignmentRow[]

  const data = rows.flatMap((row) => {
    const observationCenter = getGeometryCenter(row.observation_geometry)
    const placeCenter = getGeometryCenter(row.place_geometry)
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
