import { createFileRoute } from '@tanstack/react-router'

import { UnitFilter } from '../../../../../formsAndLists/unit/Filter.tsx'

const from = '/data/projects/$projectId_/units/filter'

export const Route = createFileRoute('/data/projects/$projectId_/units/filter')(
  {
    component: () => <UnitFilter from={from} />,
  },
)
