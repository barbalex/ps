import { Outlet, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { PlaceActionReportWithQuantities } from '../../../../../../../../../../formsAndLists/placeActionReport/WithQuantities.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_'

export const QuantitiesWrapper = () => {
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT place_action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const quantitiesInReport =
    res?.rows?.[0]?.place_action_report_quantities_in_report !== false
  if (quantitiesInReport) return <PlaceActionReportWithQuantities from={from} />
  return <Outlet />
}


















}  return <Outlet />  if (quantitiesInReport) return <PlaceActionReportWithQuantities from={from} />    res?.rows?.[0]?.place_action_report_quantities_in_report !== false  const quantitiesInReport =  )    [projectId],    `SELECT place_action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 1`,  const res = useLiveQuery(  const { projectId } = useParams({ strict: false })export const QuantitiesWrapper = () => {  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_'const from =import { PlaceActionReportWithQuantities } from '../../../../../../../../../../formsAndLists/placeActionReport/WithQuantities.tsx'import { useLiveQuery } from '@electric-sql/pglite-react'
export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/quantities-wrapper',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/quantities-wrapper"!
    </div>
  )
}
