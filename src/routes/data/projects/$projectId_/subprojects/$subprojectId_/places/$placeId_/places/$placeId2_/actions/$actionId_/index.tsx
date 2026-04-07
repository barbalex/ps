import { createFileRoute } from '@tanstack/react-router'

import { ActionIndex } from '../../../../../../../../../../../../formsAndLists/action'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionIndex
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/"
      isRootRoute={true}
    />
  ),
})
