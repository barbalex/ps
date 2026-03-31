import { createFileRoute } from '@tanstack/react-router'

import { ObservationHistoryCompare } from '../../../../../../../../../formsAndLists/observation/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/$observationId_/histories/$observationHistoryId'

export const Route = createFileRoute(from)({
  component: () => <ObservationHistoryCompare from={from} />,
})
