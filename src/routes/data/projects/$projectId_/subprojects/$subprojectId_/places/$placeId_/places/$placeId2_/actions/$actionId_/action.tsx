import { createFileRoute } from '@tanstack/react-router'

import { ActionIndex } from '../../../../../../../../../../../../formsAndLists/action'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action')({
  component: () => (
    <ActionIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action" />
  ),
})
