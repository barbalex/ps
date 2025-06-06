import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/files',
)({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFilesNavData',
  }),
})
