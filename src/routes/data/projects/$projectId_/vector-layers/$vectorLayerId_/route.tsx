import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useVectorLayerNavData',
  }),
})
