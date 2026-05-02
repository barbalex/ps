import { createFileRoute } from '@tanstack/react-router'

import { PlaceHistoryCompare } from '../../../../../../../../../../../formsAndLists/place/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/histories/$placeHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/histories/$placeHistoryId')({
  component: () => <PlaceHistoryCompare from={from} />,
})
