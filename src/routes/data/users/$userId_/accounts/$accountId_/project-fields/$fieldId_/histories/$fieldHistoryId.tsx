import { createFileRoute } from '@tanstack/react-router'

import { FieldHistoryCompare } from '../../../../../../../../../formsAndLists/field/HistoryCompare.tsx'

const from =
  '/data/users/$userId_/accounts/$accountId_/project-fields/$fieldId_/histories/$fieldHistoryId'

export const Route = createFileRoute('/data/users/$userId_/accounts/$accountId_/project-fields/$fieldId_/histories/$fieldHistoryId')({
  component: () => <FieldHistoryCompare from={from} />,
})
