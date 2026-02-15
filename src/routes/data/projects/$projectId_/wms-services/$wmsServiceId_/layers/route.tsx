import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.wmsServiceId || params.wmsServiceId === 'undefined') {
      throw new Error('Invalid or missing wmsServiceId in route parameters')
    }
    return {
    navDataFetcher: 'useWmsServiceLayersNavData',
  }
  },
})
