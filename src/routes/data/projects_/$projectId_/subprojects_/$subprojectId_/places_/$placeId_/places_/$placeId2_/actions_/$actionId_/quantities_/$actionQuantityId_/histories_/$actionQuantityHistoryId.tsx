import { createFileRoute } from '@tanstack/react-router'

import { ActionQuantityHistoryCompare } from '../../../../../../../../../../../../../../../formsAndLists/actionQuantity/HistoryCompare.tsx'

export const Route = createFileRoute(
  '/data/projects_/$projectId_/subprojects_/$subprojectId_/places_/$placeId_/places_/$placeId2_/actions_/$actionId_/quantities_/$actionQuantityId_/histories_/$actionQuantityHistoryId',
)({
  component: () => <ActionQuantityHistoryCompare from={Route.fullPath} />,
})
