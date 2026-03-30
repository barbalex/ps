import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ActionReportList } from './List.tsx'

export const ActionReportIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const quantitiesInReport =
    res?.rows?.[0]?.action_report_quantities_in_report !== false
  // WithQuantities is rendered by the layout route; only show the list view when quantities are not inline
  if (quantitiesInReport) return null
  return <ActionReportList from={from} />
}
