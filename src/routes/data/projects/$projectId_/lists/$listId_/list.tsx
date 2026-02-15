import { createFileRoute } from '@tanstack/react-router'

import { List } from '../../../../../../formsAndLists/list/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/list',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.listId_ || params.listId_ === 'undefined') {
      throw new Error('Invalid or missing listId_ in route parameters')
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
