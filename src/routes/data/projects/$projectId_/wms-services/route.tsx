import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/projects/$projectId_/wms-services')(
  {
    component: Outlet,
    beforeLoad: ({ params }) => {
      if (!params.projectId || params.projectId === 'undefined') {
        throw new Error('Invalid or missing projectId in route parameters')
      }
      return {
        navDataFetcher: 'useWmsServicesNavData',
      }
    },
  },
)
