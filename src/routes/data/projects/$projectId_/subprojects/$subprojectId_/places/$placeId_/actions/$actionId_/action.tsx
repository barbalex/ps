import { createFileRoute } from '@tanstack/react-router'

import { ActionIndex } from '../../../../../../../../../../formsAndLists/action'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/action'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/action" />
  ),
})
