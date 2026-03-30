import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { CheckReportList } from './List.tsx'

export const CheckReportIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT check_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInReport =
    res?.rows?.[0]?.check_report_quantities_in_report !== false
  // Layout route renders CheckReportWithQuantities when enabled
  if (quantitiesInReport) return null
  return <CheckReportList from={from} />
}
