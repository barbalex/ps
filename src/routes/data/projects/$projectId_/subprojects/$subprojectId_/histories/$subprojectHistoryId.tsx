import { createFileRoute } from '@tanstack/react-router'

import { SubprojectHistory } from '../../../../../../../formsAndLists/subprojectHistory/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/histories/$subprojectHistoryId',
)({
  component: SubprojectHistory,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectHistoryNavData',
  }),
})
