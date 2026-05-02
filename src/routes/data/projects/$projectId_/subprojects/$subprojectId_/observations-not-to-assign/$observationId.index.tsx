import { createFileRoute } from '@tanstack/react-router'

import { Observation } from '../../../../../../../formsAndLists/observation/index.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/$observationId/')({
  component: () => (
    <Observation from="/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/$observationId/" />
  ),
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.observationId || params.observationId === 'undefined') {
      throw new Error('Invalid or missing observationId in route parameters')
    }
    return {
      navDataFetcher: 'useObservationNotToAssignNavData',
    }
  },
})
