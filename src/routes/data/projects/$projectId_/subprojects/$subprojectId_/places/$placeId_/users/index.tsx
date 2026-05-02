import { createFileRoute } from '@tanstack/react-router'

import { PlaceUsers } from '../../../../../../../../../formsAndLists/placeUsers.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/')({
  component: () => (
    <PlaceUsers from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/" />
  ),
  notFoundComponent: NotFound,
})
