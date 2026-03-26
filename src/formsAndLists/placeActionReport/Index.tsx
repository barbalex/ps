import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { PlaceActionReportList } from './List.tsx'
import { PlaceActionReportWithQuantities } from './WithQuantities.tsx'

export const PlaceActionReportIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT place_action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInReport =
    res?.rows?.[0]?.place_action_report_quantities_in_report !== false
  return quantitiesInReport ? (
    <PlaceActionReportWithQuantities from={from} />
  ) : (
    <PlaceActionReportList from={from} />
  )
}
