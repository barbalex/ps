import { createFileRoute } from '@tanstack/react-router'

import { ActionQuantities } from '../../../../../../../../../../../formsAndLists/actionQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionQuantities
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
