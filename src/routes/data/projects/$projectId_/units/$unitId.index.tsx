import { createFileRoute } from '@tanstack/react-router'

import { Unit } from '../../../../../formsAndLists/unit/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/units/$unitId/',
)({
  component: Unit,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.unitId || params.unitId === 'undefined') {
      throw new Error('Invalid or missing unitId in route parameters')
    }
    return {
    navDataFetcher: 'useUnitNavData',
  }
  },
})
