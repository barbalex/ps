import { createFileRoute } from '@tanstack/react-router'

import { FieldHistoryCompare } from '../../../../../../../formsAndLists/field/HistoryCompare.tsx'

const from = '/data/projects/$projectId_/fields/$fieldId_/histories/$fieldHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/fields/$fieldId_/histories/$fieldHistoryId')({
  component: () => <FieldHistoryCompare from={from} />,
})
