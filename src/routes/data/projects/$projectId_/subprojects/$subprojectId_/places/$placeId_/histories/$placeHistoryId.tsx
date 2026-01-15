import { createFileRoute } from '@tanstack/react-router'

import { PlaceHistory } from '../../../../../../../../../formsAndLists/placeHistory/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/histories/$placeHistoryId',
)({
  component: PlaceHistory,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceHistoryNavData',
  }),
})
