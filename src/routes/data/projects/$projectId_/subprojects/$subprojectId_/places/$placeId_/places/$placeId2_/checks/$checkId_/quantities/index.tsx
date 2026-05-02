import { createFileRoute } from '@tanstack/react-router'

import { CheckQuantities } from '../../../../../../../../../../../../../formsAndLists/checkQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/quantities/')({
  component: () => (
    <CheckQuantities
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/quantities/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
