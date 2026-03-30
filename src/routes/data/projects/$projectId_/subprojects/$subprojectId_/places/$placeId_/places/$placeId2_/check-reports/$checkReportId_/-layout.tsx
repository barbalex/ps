import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { CheckReportWithQuantities } from '../../../../../../../../../../../../formsAndLists/checkReport/WithQuantities.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$checkReportId_'

export const CheckReportLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT check_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const quantitiesInReport =
    res?.rows?.[0]?.check_report_quantities_in_report !== false
  const isReportHistoryRoute =
    location.pathname.includes('/histories/') &&
    !location.pathname.includes('/quantities/')
  if (quantitiesInReport && !isReportHistoryRoute)
    return <CheckReportWithQuantities from={from} />
  return <Outlet />
}
