import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ActionReportList } from './List.tsx'
import { ActionReportWithQuantities } from './WithQuantities.tsx'

export const ActionReportIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInReport =
    res?.rows?.[0]?.action_report_quantities_in_report !== false
  return quantitiesInReport ? (
    <ActionReportWithQuantities from={from} />
  ) : (
    <ActionReportList from={from} />
  )
}
