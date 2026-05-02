import { createFileRoute } from '@tanstack/react-router'

import { ObservationHistoryCompare } from '../../../../../../../../../../../formsAndLists/observation/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/observations/$observationId_/histories/$observationHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/observations/$observationId_/histories/$observationHistoryId')({
  component: () => <ObservationHistoryCompare from={from} />,
})
