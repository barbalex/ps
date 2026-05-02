import { createFileRoute } from '@tanstack/react-router'

import { ProjectUserHistoryCompare } from '../../../../../../../formsAndLists/projectUser/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/users/$projectUserId_/histories/$projectUserHistoryId')({
  component: ProjectUserHistoryCompare,
})
