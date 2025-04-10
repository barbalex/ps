import { createFileRoute } from '@tanstack/react-router'

import { PlaceList } from '../../../../../../../../formsAndLists/place/List.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PlaceList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/" />
  )
}
