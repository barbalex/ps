import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.vectorLayerId || params.vectorLayerId === 'undefined') {
      throw new Error('Invalid or missing vectorLayerId in route parameters')
    }
    return {
    navDataFetcher: 'useVectorLayerDisplaysNavData',
  }
  },
})
