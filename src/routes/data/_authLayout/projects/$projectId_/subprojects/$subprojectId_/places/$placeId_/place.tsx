import { createFileRoute } from '@tanstack/react-router'

import { Place } from '../../../../../../../../../formsAndLists/place/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Place from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place" />
  )
}
