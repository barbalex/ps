import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useActionReportsNavData',
  }),
})
