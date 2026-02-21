import { createFileRoute } from '@tanstack/react-router'

import { GoalList } from '../../../../../../../../formsAndLists/goal/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <GoalList from="/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/" />
  ),
})
