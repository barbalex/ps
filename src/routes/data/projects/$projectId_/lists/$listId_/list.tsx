import { createFileRoute } from '@tanstack/react-router'

import { List } from '../../../../../../formsAndLists/list/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/list',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useListListNavData',
  }),
})

function RouteComponent() {
  return (
    <List from="/data/projects/$projectId_/lists/$listId_/list" />
  )
}
