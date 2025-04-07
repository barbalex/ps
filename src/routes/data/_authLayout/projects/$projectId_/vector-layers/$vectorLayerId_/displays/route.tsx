import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers/$vectorLayerId_/displays',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useVectorLayerDisplaysNavData',
  }),
})
