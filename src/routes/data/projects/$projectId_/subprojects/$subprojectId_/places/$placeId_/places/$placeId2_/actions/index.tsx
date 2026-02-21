import { createFileRoute } from '@tanstack/react-router'

import { Actions } from '../../../../../../../../../../../formsAndLists/actions.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/'

export const Route = createFileRoute(from)({
  component: () => (
    <Actions from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/" />
  ),
  notFoundComponent: NotFound,
})
