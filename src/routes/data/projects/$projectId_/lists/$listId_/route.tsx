import { createFileRoute } from '@tanstack/react-router'

import { ListLayout } from './-layout.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_',
)({
  component: ListLayout,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.listId || params.listId === 'undefined') {
      throw new Error('Invalid or missing listId in route parameters')
    }
    return {
      navDataFetcher: 'useListNavData',
    }
  },
})
