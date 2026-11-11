import { createFileRoute } from '@tanstack/react-router'

import { TableViewFilter } from '../../../../../formsAndLists/tableView/Filter.tsx'

const from = '/data/projects/$projectId_/table-views/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/table-views/filter',
)({
  component: () => <TableViewFilter from={from} />,
})
