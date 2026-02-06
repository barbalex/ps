import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/projects/$projectId_/wfs-services')(
  {
    component: Outlet,
    beforeLoad: () => ({
      navDataFetcher: 'useWfsServicesNavData',
    }),
  },
)
