import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { PlaceCheckReportWithQuantities } from '../../../../../../../../../../formsAndLists/placeCheckReport/WithQuantities.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/check-reports/$placeCheckReportId_'

export const PlaceCheckReportLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT place_check_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const quantitiesInReport =
    res?.rows?.[0]?.place_check_report_quantities_in_report !== false
  const isReportHistoryRoute =
    location.pathname.includes('/histories/') &&
    !location.pathname.includes('/quantities/')
  if (quantitiesInReport && !isReportHistoryRoute)
    return <PlaceCheckReportWithQuantities from={from} />
  return <Outlet />
}
