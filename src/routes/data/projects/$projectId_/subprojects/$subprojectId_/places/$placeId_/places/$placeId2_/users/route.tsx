import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceUsersNavData',
  }),
})
