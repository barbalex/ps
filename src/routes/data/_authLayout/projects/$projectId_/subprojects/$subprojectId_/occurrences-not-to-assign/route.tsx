import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useOccurrencesNavData',
  }),
})
