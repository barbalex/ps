import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWfsServiceLayersNavData',
  }),
})
