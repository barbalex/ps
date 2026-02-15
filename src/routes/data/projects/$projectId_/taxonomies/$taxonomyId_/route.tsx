import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/taxonomies/$taxonomyId_',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.taxonomyId || params.taxonomyId === 'undefined') {
      throw new Error('Invalid or missing taxonomyId in route parameters')
    }
    return {
    navDataFetcher: 'useTaxonomyNavData',
  }
  },
})
