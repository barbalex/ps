import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useCheckTaxaNavData',
  }),
})
