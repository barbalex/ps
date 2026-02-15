import { createFileRoute } from '@tanstack/react-router'

import { ListValue } from '../../../../../../../formsAndLists/listValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_/values/$listValueId/',
)({
  component: ListValue,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.listId_ || params.listId_ === 'undefined') {
      throw new Error('Invalid or missing listId_ in route parameters')
    }
    if (!params.listValueId || params.listValueId === 'undefined') {
      throw new Error('Invalid or missing listValueId in route parameters')
    }
    return {
    navDataFetcher: 'useListValueNavData',
  }
  },
})
