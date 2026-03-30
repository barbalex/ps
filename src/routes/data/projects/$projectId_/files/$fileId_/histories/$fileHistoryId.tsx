import { createFileRoute } from '@tanstack/react-router'

import { FileHistoryCompare } from '../../../../../../../formsAndLists/file/HistoryCompare.tsx'

const from = '/data/projects/$projectId_/files/$fileId_/histories/$fileHistoryId'

export const Route = createFileRoute(from)({
  component: () => <FileHistoryCompare from={from} />,
})
