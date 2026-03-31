import { createFileRoute } from '@tanstack/react-router'

import { UnitHistoryCompare } from '../../../../../../../formsAndLists/unit/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/units/$unitId_/histories/$unitHistoryId'

export const Route = createFileRoute(from)({
  component: UnitHistoryCompare,
})
