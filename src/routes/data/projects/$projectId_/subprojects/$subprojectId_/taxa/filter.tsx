import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxonFilter } from '../../../../../../../formsAndLists/subprojectTaxon/Filter.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/filter'

export const Route = createFileRoute(from)({
  component: () => <SubprojectTaxonFilter from={from} />,
})
