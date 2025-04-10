import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useVectorLayersNavData',
  }),
})
