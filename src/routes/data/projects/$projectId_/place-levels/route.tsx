import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/place-levels',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceLevelsNavData',
  }),
})
