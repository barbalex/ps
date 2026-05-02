import { createFileRoute } from '@tanstack/react-router'

import { UnitHistoryCompare } from '../../../../../../../formsAndLists/unit/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/units/$unitId_/histories/$unitHistoryId')({
  component: UnitHistoryCompare,
})
