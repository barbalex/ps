import { createFileRoute } from '@tanstack/react-router'

import { FieldFilter } from '../../../../../formsAndLists/field/Filter.tsx'

const from = '/data/projects/$projectId_/fields/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/fields/filter',
)({
  component: () => <FieldFilter from={from} />,
})
