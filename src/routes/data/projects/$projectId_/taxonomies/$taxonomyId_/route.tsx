import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/taxonomies/$taxonomyId_',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.taxonomyId_ || params.taxonomyId_ === 'undefined') {
      throw new Error('Invalid or missing taxonomyId_ in route parameters')
    }
    return {
    navDataFetcher: 'useTaxonomyNavData',
  }
  },
})
