import { createFileRoute, Outlet, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { PlaceActionReportWithQuantities } from '../../../../../../../../../../../formsAndLists/placeActionReport/WithQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_'

const QuantitiesWrapper = () => {
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT place_action_report_quantities_in_report FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  if (!res) return null
  const quantitiesInReport =
    res.rows?.[0]?.place_action_report_quantities_in_report !== false
  if (quantitiesInReport) return <PlaceActionReportWithQuantities from={from} />
  return <Outlet />
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/action-reports/$placeActionReportId_/quantities',
)({
  component: QuantitiesWrapper,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (
      !params.placeActionReportId ||
      params.placeActionReportId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing placeActionReportId in route parameters',
      )
    }
    return {
      navDataFetcher: 'usePlaceActionReportQuantitiesNavData',
    }
  },
})
