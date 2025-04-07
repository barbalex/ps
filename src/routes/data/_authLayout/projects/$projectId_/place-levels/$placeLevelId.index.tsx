import { createFileRoute } from '@tanstack/react-router'

import { PlaceLevel } from '../../../../../../formsAndLists/placeLevel/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/place-levels/$placeLevelId/',
)({
  component: PlaceLevel,
  beforeLoad: () => ({
    navDataFetcher: 'usePlaceLevelNavData',
  }),
})
