import { createFileRoute } from '@tanstack/react-router'

import { PlaceUsers } from '../../../../../../../../../formsAndLists/placeUsers.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceUsers from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/" />
  ),
  notFoundComponent: NotFound,
})
