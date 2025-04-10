import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/files/$fileId_',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFileNavData',
  }),
})
