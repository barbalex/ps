import { createFileRoute, Outlet } from '@tanstack/react-router'

import { NotFound } from '../../../components/NotFound.tsx'

// this route is ONLY needed to add the `useProjectsNavData` to the context
// because the index route is not accumulated
export const Route = createFileRoute('/data/projects')({
  component: Outlet,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectsNavData',
  }),
})
