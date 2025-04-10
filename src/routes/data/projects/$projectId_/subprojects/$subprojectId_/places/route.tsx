import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'usePlacesNavData',
  }),
})
