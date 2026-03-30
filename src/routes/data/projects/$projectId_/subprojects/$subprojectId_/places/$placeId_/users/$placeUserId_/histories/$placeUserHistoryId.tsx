import { createFileRoute } from '@tanstack/react-router'

import { PlaceUserHistoryCompare } from '../../../../../../../../../../../formsAndLists/placeUser/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/users/$placeUserId_/histories/$placeUserHistoryId'

export const Route = createFileRoute(from)({
  component: () => <PlaceUserHistoryCompare from={from} />,
})
