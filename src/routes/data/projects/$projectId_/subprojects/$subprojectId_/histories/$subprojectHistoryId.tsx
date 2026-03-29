import { createFileRoute } from '@tanstack/react-router'

import { SubprojectHistoryCompare } from '../../../../../../../formsAndLists/subproject/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/histories/$subprojectHistoryId'

export const Route = createFileRoute(from)({
  component: () => <SubprojectHistoryCompare from={from} />,
})
