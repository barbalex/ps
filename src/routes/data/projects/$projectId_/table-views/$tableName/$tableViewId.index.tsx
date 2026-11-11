import { createFileRoute } from '@tanstack/react-router'

import { TableView } from '../../../../../../formsAndLists/tableView/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/table-views/$tableName/$tableViewId/',
)({
  component: TableView,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.tableViewId || params.tableViewId === 'undefined') {
      throw new Error(
        'Invalid or missing tableViewId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useTableViewNavData',
    }
  },
})
