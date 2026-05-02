import { createFileRoute } from '@tanstack/react-router'

import { ObservationToAssessFilter } from '../../../../../../../formsAndLists/observation/ToAssessFilter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observations-to-assess/filter'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/observations-to-assess/filter')({
  component: () => <ObservationToAssessFilter from={from} />,
})
