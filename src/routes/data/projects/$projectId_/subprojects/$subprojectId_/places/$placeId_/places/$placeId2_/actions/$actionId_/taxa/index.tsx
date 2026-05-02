import { createFileRoute } from '@tanstack/react-router'

import { ActionTaxa } from '../../../../../../../../../../../../../formsAndLists/actionTaxa.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/taxa/')({
  component: () => (
    <ActionTaxa
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/taxa/"
      hideTitle={true}
    />
  ),
  notFoundComponent: NotFound,
})
