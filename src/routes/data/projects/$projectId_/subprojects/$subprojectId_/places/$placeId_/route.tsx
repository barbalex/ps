import { createFileRoute } from '@tanstack/react-router'
import { PlaceLayout } from './-layout.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_',
)({
  component: PlaceLayout,
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
    return {
      navDataFetcher: 'usePlaceNavData',
    }
  },
})
