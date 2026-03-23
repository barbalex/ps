import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { PlaceReportList } from './List.tsx'
import { PlaceReportWithQuantities } from './WithQuantities.tsx'

export const PlaceReportIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT place_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInReport =
    res?.rows?.[0]?.place_report_quantities_in_report !== false
  return quantitiesInReport ? (
    <PlaceReportWithQuantities from={from} />
  ) : (
    <PlaceReportList from={from} />
  )
}
