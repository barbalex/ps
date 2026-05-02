import { createFileRoute } from '@tanstack/react-router'

import { FieldFilter } from '../../../../../../../formsAndLists/field/Filter.tsx'

const from = '/data/users/$userId_/accounts/$accountId_/project-fields/filter'

export const Route = createFileRoute('/data/users/$userId_/accounts/$accountId_/project-fields/filter')({
  component: () => <FieldFilter from={from} />,
})
