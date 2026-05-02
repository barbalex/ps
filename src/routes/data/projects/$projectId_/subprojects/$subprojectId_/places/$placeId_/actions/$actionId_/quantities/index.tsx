import { createFileRoute } from '@tanstack/react-router'

import { ActionQuantities } from '../../../../../../../../../../../formsAndLists/actionQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities/')({
  component: () => (
    <ActionQuantities
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
