import { createFileRoute } from '@tanstack/react-router'

import { PlaceLevel } from '../../../../../formsAndLists/placeLevel/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/place-levels/$placeLevelId/',
)({
  component: PlaceLevel,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.placeLevelId || params.placeLevelId === 'undefined') {
      throw new Error('Invalid or missing placeLevelId in route parameters')
    }
    return {
    navDataFetcher: 'usePlaceLevelNavData',
  }
  },
})
