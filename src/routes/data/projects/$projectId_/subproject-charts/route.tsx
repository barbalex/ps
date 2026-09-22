import { createFileRoute, Outlet } from '@tanstack/react-router'

// charts for all subprojects of the project (templates) — design-time section
export const Route = createFileRoute('/data/projects/$projectId_/subproject-charts')({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    return {
      navDataFetcher: 'useSubprojectChartsNavData',
    }
  },
})
