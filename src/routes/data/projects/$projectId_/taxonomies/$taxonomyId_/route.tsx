import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/taxonomies/$taxonomyId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useTaxonomyNavData',
  }),
})
