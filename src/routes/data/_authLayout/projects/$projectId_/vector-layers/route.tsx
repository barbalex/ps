import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/vector-layers',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useVectorLayersNavData',
  }),
})
