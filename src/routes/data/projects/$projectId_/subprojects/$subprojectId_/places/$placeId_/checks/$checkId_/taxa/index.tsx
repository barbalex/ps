import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxa } from '../../../../../../../../../../../formsAndLists/checkTaxa.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/')({
  component: () => (
    <CheckTaxa
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
