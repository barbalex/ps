import { createFileRoute } from '@tanstack/react-router'

import { PlaceUser } from '../../../../../../../../../formsAndLists/placeUser/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.placeId_ || params.placeId_ === 'undefined') {
      throw new Error('Invalid or missing placeId_ in route parameters')
    }
    if (!params.placeUserId || params.placeUserId === 'undefined') {
      throw new Error('Invalid or missing placeUserId in route parameters')
    }
    return {
    navDataFetcher: 'usePlaceUserNavData',
  }
  },
})

function RouteComponent() {
  return (
    <PlaceUser from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId/" />
  )
}
