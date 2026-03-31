import { createFileRoute } from '@tanstack/react-router'

import { GoalHistoryCompare } from '../../../../../../../../../formsAndLists/goal/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/histories/$goalHistoryId'

export const Route = createFileRoute(from)({
  component: GoalHistoryCompare,
})
