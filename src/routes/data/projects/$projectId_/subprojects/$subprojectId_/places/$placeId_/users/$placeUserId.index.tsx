import { createFileRoute } from '@tanstack/react-router'

import { PlaceUser } from '../../../../../../../../../formsAndLists/placeUser/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId/'

export const Route = createFileRoute(from)({
  component: () => (
    <PlaceUser from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId/" />
  ),
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (!params.placeUserId || params.placeUserId === 'undefined') {
      throw new Error('Invalid or missing placeUserId in route parameters')
    }
    return {
      navDataFetcher: 'usePlaceUserNavData',
    }
  },
})
