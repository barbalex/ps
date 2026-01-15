import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/designs/$subprojectReportDesignId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectReportDesignNavData',
  }),
})
