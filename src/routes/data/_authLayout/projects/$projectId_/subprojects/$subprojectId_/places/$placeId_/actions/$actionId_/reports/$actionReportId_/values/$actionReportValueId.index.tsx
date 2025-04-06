import { createFileRoute } from '@tanstack/react-router'

import { ActionReportValue } from '../../../../../../../../../../../../../../formsAndLists/actionReportValue/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/values/$actionReportValueId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useActionReportValueNavData',
  }),
})

function RouteComponent() {
  return (
    <ActionReportValue from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/values/$actionReportValueId/" />
  )
}
