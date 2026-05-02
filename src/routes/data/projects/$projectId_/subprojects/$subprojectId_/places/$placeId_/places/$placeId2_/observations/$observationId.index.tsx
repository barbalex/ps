import { createFileRoute } from '@tanstack/react-router'

import { Observation } from '../../../../../../../../../../../formsAndLists/observation/index.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/observations/$observationId/')({
  component: () => (
    <Observation from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/observations/$observationId/" />
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
    if (!params.placeId2 || params.placeId2 === 'undefined') {
      throw new Error('Invalid or missing placeId2 in route parameters')
    }
    if (!params.observationId || params.observationId === 'undefined') {
      throw new Error('Invalid or missing observationId in route parameters')
    }
    return {
      navDataFetcher: 'useObservationAssignedNavData',
    }
  },
})
