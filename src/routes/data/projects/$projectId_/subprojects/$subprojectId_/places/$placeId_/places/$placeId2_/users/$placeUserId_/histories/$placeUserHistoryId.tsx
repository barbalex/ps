import { createFileRoute } from '@tanstack/react-router'

import { PlaceUserHistoryCompare } from '../../../../../../../../../../../../../formsAndLists/placeUser/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/$placeUserId_/histories/$placeUserHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/users/$placeUserId_/histories/$placeUserHistoryId')({
  component: () => <PlaceUserHistoryCompare from={from} />,
})
