import { createFileRoute } from '@tanstack/react-router'

import { Unit } from '../../../../../formsAndLists/unit/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/units/$unitId/',
)({
  component: Unit,
  beforeLoad: () => ({
    navDataFetcher: 'useUnitNavData',
  }),
})
