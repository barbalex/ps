import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxon } from '../../../../../../../../formsAndLists/subprojectTaxon/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useSubprojectTaxonNavData',
  }),
})

const RouteComponent = () => {
  return (
    <SubprojectTaxon from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/" />
  )
}
