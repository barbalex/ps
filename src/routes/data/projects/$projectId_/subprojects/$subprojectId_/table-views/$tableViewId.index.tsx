import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTableView } from '../../../../../../../formsAndLists/subproject/TableView.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/table-views/$tableViewId/',
)({
  component: SubprojectTableView,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.tableViewId || params.tableViewId === 'undefined') {
      throw new Error(
        'Invalid or missing tableViewId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useSubprojectTableViewNavData',
    }
  },
})
