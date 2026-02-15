import { createFileRoute } from '@tanstack/react-router'

import { SubprojectHistory } from '../../../../../../../formsAndLists/subprojectHistory/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/histories/$subprojectHistoryId',
)({
  component: SubprojectHistory,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.subprojectHistoryId || params.subprojectHistoryId === 'undefined') {
      throw new Error('Invalid or missing subprojectHistoryId in route parameters')
    }
    return {
    navDataFetcher: 'useSubprojectHistoryNavData',
  }
  },
})
