import { createFileRoute } from '@tanstack/react-router'

import { Unit } from '../../../../../formsAndLists/unit/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/units/$unitId/',
)({
  component: Unit,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.unitId || params.unitId === 'undefined') {
      throw new Error('Invalid or missing unitId in route parameters')
    }
    return {
    navDataFetcher: 'useUnitNavData',
  }
  },
})
