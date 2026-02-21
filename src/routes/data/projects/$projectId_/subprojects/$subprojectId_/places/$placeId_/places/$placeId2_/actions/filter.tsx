import { createFileRoute } from '@tanstack/react-router'

import { ActionFilter } from '../../../../../../../../../../../formsAndLists/action/Filter.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/filter',
)({
  component: () => <ActionFilter from={from} level={1} />,
})
