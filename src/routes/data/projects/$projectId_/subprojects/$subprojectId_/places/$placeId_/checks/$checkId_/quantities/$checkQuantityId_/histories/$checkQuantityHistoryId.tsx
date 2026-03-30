import { createFileRoute } from '@tanstack/react-router'

import { CheckQuantityHistoryCompare } from '../../../../../../../../../../../../../formsAndLists/checkQuantity/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/quantities/$checkQuantityId_/histories/$checkQuantityHistoryId'

export const Route = createFileRoute(from)({
  component: () => <CheckQuantityHistoryCompare from={from} />,
})
