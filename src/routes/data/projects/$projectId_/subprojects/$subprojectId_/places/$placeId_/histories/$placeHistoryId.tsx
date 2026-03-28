import { createFileRoute } from '@tanstack/react-router'

import { PlaceHistoryCompare } from '../../../../../../../../../formsAndLists/place/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/histories/$placeHistoryId'

export const Route = createFileRoute(from)({
  component: () => <PlaceHistoryCompare from={from} />,
})
