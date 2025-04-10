import { createFileRoute, Outlet } from '@tanstack/react-router'

import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_')({
  component: Outlet,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectNavData',
  }),
})
