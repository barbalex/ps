import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useActionReportNavData',
  }),
})
