import { createFileRoute } from '@tanstack/react-router'

import { PlaceUser } from '../../../../../../../../../../formsAndLists/placeUser/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceUserNavData',
  }),
})

function RouteComponent() {
  return (
    <PlaceUser from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId/" />
  )
}
