import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/values',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.listId || params.listId === 'undefined') {
      throw new Error('Invalid or missing listId in route parameters')
    }
    return {
    navDataFetcher: 'useListValuesNavData',
  }
  },
})
