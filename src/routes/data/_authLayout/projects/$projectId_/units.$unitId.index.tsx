import { createFileRoute } from '@tanstack/react-router'

import { Unit } from '../../../../../formsAndLists/unit/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/units/$unitId/',
)({
  component: Unit,
})
