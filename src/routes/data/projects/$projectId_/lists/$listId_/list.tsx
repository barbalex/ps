import { createFileRoute } from '@tanstack/react-router'

import { ListWithValues } from '../../../../../../formsAndLists/list/WithValues.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/lists/$listId_/list')({
  component: () => (
    <ListWithValues from="/data/projects/$projectId_/lists/$listId_/list" />
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
