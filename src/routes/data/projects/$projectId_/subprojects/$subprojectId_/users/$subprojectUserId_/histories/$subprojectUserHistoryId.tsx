import { createFileRoute } from '@tanstack/react-router'

import { SubprojectUserHistoryCompare } from '../../../../../../../../../formsAndLists/subprojectUser/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId_/histories/$subprojectUserHistoryId')({
  component: SubprojectUserHistoryCompare,
})
