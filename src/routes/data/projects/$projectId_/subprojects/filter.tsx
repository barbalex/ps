import { createFileRoute } from '@tanstack/react-router'

import { SubprojectFilter } from '../../../../../formsAndLists/subproject/Filter.tsx'

const from = '/data/projects/$projectId_/subprojects/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/filter',
)({
  component: () => <SubprojectFilter from={from} />,
})
