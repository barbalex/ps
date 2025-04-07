import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/place-levels',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceLevelsNavData',
  }),
})
