import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useActionNavData',
  }),
})
