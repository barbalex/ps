import { Outlet, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { PlaceCheckReportWithQuantities } from '../../../../../../../../../../../../formsAndLists/placeCheckReport/WithQuantities.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/check-reports/$placeCheckReportId_'

export const PlaceCheckReportLayout = () => {
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT place_check_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const quantitiesInReport =
    res?.rows?.[0]?.place_check_report_quantities_in_report !== false
  if (quantitiesInReport)
    return <PlaceCheckReportWithQuantities from={from} />
  return <Outlet />
}
