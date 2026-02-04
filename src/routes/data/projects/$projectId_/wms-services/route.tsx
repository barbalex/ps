import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsServicesNavData',
  }),
})
