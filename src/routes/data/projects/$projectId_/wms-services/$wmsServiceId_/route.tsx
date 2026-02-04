import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsServiceNavData',
  }),
})
