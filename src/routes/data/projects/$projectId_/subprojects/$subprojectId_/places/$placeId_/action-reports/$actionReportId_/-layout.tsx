import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { ActionReportWithQuantities } from '../../../../../../../../../../formsAndLists/actionReport/WithQuantities.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$actionReportId_'

export const ActionReportLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const quantitiesInReport =
    res?.rows?.[0]?.action_report_quantities_in_report !== false
  const isHistoryRoute = location.pathname.includes('/histories/')
  if (quantitiesInReport && !isHistoryRoute)
    return <ActionReportWithQuantities from={from} />
  return <Outlet />
}
