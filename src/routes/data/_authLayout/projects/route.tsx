import { createFileRoute, Outlet } from '@tanstack/react-router'

// this route is ONLY needed to add the `useProjectsNavData` to the context
// because the index route is not accumulated
export const Route = createFileRoute('/data/_authLayout/projects')({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectsNavData',
  }),
})

function RouteComponent() {
  return <Outlet />
}
