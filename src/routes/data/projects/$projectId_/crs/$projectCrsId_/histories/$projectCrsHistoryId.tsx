import { createFileRoute } from '@tanstack/react-router'

import { ProjectCrsHistoryCompare } from '../../../../../../../formsAndLists/projectCrs/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/crs/$projectCrsId_/histories/$projectCrsHistoryId'

export const Route = createFileRoute(from)({
  component: ProjectCrsHistoryCompare,
})
