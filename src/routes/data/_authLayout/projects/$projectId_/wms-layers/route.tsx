import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/wms-layers',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWmsLayersNavData',
  }),
})
