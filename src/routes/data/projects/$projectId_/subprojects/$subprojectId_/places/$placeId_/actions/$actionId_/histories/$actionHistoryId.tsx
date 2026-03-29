import { createFileRoute } from '@tanstack/react-router'

import { ActionHistoryCompare } from '../../../../../../../../../../../formsAndLists/action/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/histories/$actionHistoryId'

export const Route = createFileRoute(from)({
  component: () => <ActionHistoryCompare from={from} />,
})
