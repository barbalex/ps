import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useOccurrenceImportsNavData',
  }),
})
