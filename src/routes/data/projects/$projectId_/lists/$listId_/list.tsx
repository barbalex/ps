import { createFileRoute } from '@tanstack/react-router'

import { List } from '../../../../../../formsAndLists/list/index.tsx'
const from = '/data/projects/$projectId_/lists/$listId_/list'

export const Route = createFileRoute(from)({
  component: () => (
    <List from="/data/projects/$projectId_/lists/$listId_/list" />
  ),
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
