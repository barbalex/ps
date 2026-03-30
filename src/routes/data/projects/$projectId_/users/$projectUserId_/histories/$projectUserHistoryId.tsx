import { createFileRoute } from '@tanstack/react-router'

import { ProjectUserHistoryCompare } from '../../../../../../../formsAndLists/projectUser/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/users/$projectUserId_/histories/$projectUserHistoryId'

export const Route = createFileRoute(from)({
  component: ProjectUserHistoryCompare,
})
