import { createFileRoute } from '@tanstack/react-router'

import { ActionTaxa } from '../../../../../../../../../../../formsAndLists/actionTaxa.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionTaxa
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
