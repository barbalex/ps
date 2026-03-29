import { createFileRoute } from '@tanstack/react-router'

import { ActionQuantityHistoryCompare } from '../../../../../../../../../../../../../formsAndLists/actionQuantity/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities/$actionQuantityId_/histories/$actionQuantityHistoryId'

export const Route = createFileRoute(from)({
  component: () => <ActionQuantityHistoryCompare from={from} />,
})
