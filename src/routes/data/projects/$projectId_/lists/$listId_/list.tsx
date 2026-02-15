import { createFileRoute } from '@tanstack/react-router'

import { List } from '../../../../../../formsAndLists/list/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/list',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.listId || params.listId === 'undefined') {
      throw new Error('Invalid or missing listId in route parameters')
    }
    return {
    navDataFetcher: 'useListListNavData',
  }
  },
})

function RouteComponent() {
  return (
    <List from="/data/projects/$projectId_/lists/$listId_/list" />
  )
}
