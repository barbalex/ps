import { createFileRoute } from '@tanstack/react-router'

import { SubprojectHistory } from '../../../../../../../formsAndLists/subprojectHistory/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/histories/$subprojectHistoryId',
)({
  component: SubprojectHistory,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (
      !params.subprojectHistoryId ||
      params.subprojectHistoryId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing subprojectHistoryId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useSubprojectHistoryNavData',
    }
  },
})
