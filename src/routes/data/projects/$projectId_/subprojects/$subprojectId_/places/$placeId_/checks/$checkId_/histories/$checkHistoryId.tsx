import { createFileRoute } from '@tanstack/react-router'

import { CheckHistoryCompare } from '../../../../../../../../../../../formsAndLists/check/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/histories/$checkHistoryId'

export const Route = createFileRoute(from)({
  component: () => <CheckHistoryCompare from={from} />,
})
