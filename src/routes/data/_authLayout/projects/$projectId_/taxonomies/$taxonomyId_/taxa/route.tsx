import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId_/taxa',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useTaxaNavData',
  }),
})
