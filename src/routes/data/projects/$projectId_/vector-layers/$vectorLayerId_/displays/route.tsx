import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/vector-layers/$vectorLayerId_/displays',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.vectorLayerId_ || params.vectorLayerId_ === 'undefined') {
      throw new Error('Invalid or missing vectorLayerId_ in route parameters')
    }
    return {
    navDataFetcher: 'useVectorLayerDisplaysNavData',
  }
  },
})
