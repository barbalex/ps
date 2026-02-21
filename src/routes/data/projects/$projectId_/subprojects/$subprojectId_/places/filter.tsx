import { createFileRoute } from '@tanstack/react-router'

import { PlaceFilter } from '../../../../../../../formsAndLists/place/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/filter',
)({
  component: () => <PlaceFilter from={from} />,
})
