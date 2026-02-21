import { createFileRoute } from '@tanstack/react-router'

import { SubprojectUserFilter } from '../../../../../../../formsAndLists/subprojectUser/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/filter'

export const Route = createFileRoute(from)({
  component: () => <SubprojectUserFilter from={from} />,
})
