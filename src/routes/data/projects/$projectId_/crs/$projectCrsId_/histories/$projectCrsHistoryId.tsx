import { createFileRoute } from '@tanstack/react-router'

import { ProjectCrsHistoryCompare } from '../../../../../../../formsAndLists/projectCrs/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/crs/$projectCrsId_/histories/$projectCrsHistoryId')({
  component: ProjectCrsHistoryCompare,
})
