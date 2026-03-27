import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { PlaceCheckReportList } from './List.tsx'

export const PlaceCheckReportIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT place_check_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInReport =
    res?.rows?.[0]?.place_check_report_quantities_in_report !== false
  // Layout route renders PlaceCheckReportWithQuantities when enabled
  if (quantitiesInReport) return null
  return <PlaceCheckReportList from={from} />
}
