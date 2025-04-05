import { createFileRoute, Outlet } from '@tanstack/react-router'

import { ProjectList } from '../../../../formsAndLists/project/List.tsx'

export const Route = createFileRoute('/data/_authLayout/projects/$projectId')({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectNavData',
  }),
})

const RouteComponent = () => {
  return <Outlet />
  return <ProjectList from={'/data/_authLayout/projects/$projectId'} />
}
