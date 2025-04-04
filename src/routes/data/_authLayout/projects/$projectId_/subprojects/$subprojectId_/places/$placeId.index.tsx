import { createFileRoute } from '@tanstack/react-router'

import { PlaceList } from '../../../../../../../../formsAndLists/place/List.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PlaceList from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId/" />
  )
}
