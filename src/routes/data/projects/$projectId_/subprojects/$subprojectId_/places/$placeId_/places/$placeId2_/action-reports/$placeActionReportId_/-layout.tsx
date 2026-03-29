import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { PlaceActionReportWithQuantities } from '../../../../../../../../../../../../formsAndLists/placeActionReport/WithQuantities.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/action-reports/$placeActionReportId_'

export const PlaceActionReportLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT place_action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const quantitiesInReport =
    res?.rows?.[0]?.place_action_report_quantities_in_report !== false
  const isHistoryRoute = location.pathname.includes('/histories/')
  if (quantitiesInReport && !isHistoryRoute)
    return <PlaceActionReportWithQuantities from={from} />
  return <Outlet />
}
