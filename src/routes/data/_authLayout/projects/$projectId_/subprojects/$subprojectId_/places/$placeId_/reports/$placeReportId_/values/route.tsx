import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/values',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceReportValuesNavData',
  }),
})
