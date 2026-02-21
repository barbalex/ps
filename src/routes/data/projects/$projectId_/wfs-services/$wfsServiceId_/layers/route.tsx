import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.wfsServiceId || params.wfsServiceId === 'undefined') {
      throw new Error('Invalid or missing wfsServiceId in route parameters')
    }
    return {
      navDataFetcher: 'useWfsServiceLayersNavData',
    }
  },
})
