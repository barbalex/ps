import { createFileRoute } from '@tanstack/react-router'

import { SubprojectUserHistoryCompare } from '../../../../../../../../../formsAndLists/subprojectUser/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId_/histories/$subprojectUserHistoryId'

export const Route = createFileRoute(from)({
  component: SubprojectUserHistoryCompare,
})
