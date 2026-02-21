import { createFileRoute } from '@tanstack/react-router'

import { Action } from '../../../../../../../../../../../../formsAndLists/action/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action'

export const Route = createFileRoute(from)({
  component: () => (
    <Action from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action" />
  ),
})
