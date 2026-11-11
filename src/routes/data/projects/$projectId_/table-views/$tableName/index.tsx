import { createFileRoute } from '@tanstack/react-router'

import { TableViews } from '../../../../../../formsAndLists/tableViews.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/table-views/$tableName/',
)({
  component: TableViews,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.tableName || params.tableName === 'undefined') {
      throw new Error('Invalid or missing tableName in route parameters')
    }
    return {
      navDataFetcher: 'useTableViewsNavData',
    }
  },
})
