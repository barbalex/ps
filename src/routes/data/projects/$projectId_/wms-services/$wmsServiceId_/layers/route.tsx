import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.wmsServiceId_ || params.wmsServiceId_ === 'undefined') {
      throw new Error('Invalid or missing wmsServiceId_ in route parameters')
    }
    return {
    navDataFetcher: 'useWmsServiceLayersNavData',
  }
  },
})
