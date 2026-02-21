import { createFileRoute } from '@tanstack/react-router'

import { ActionList } from '../../../../../../../../../../formsAndLists/action/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/" />
  ),
})
