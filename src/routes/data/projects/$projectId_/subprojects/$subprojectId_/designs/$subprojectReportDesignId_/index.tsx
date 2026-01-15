import { createFileRoute, redirect } from '@tanstack/react-router'

import { SubprojectReportDesign } from '../../../../../../../../formsAndLists/subprojectReportDesign/index.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/designs/$subprojectReportDesignId_/',
)({
  component: SubprojectReportDesign,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectReportDesignNavData',
  }),
  loader: ({ params }) => {
    throw redirect({
      to: '/data/projects/$projectId_/subprojects/$subprojectId_/designs/$subprojectReportDesignId_',
      params,
    })
  },
})
