import { createFileRoute } from '@tanstack/react-router'

import { GoalHistoryCompare } from '../../../../../../../../../formsAndLists/goal/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/histories/$goalHistoryId')({
  component: GoalHistoryCompare,
})
