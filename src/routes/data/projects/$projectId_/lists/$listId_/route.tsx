import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_',
)({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.listId_ || params.listId_ === 'undefined') {
      throw new Error('Invalid or missing listId_ in route parameters')
    }
    return {
    navDataFetcher: 'useListNavData',
  }
  },
})
