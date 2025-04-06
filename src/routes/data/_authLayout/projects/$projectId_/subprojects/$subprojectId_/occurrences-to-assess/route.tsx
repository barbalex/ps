import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useOccurrencesNavData',
  }),
})
