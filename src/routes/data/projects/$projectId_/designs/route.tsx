import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/projects/$projectId_/designs')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectReportDesignsNavData',
  }),
})
