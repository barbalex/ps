import { createFileRoute } from '@tanstack/react-router'

import { ObservationNotToAssignFilter } from '../../../../../../../formsAndLists/observation/NotToAssignFilter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/filter'

export const Route = createFileRoute(from)({
  component: () => <ObservationNotToAssignFilter from={from} />,
})
