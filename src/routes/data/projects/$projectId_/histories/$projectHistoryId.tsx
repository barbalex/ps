import { createFileRoute } from '@tanstack/react-router'

import { ProjectHistoryCompare } from '../../../../../formsAndLists/project/HistoryCompare.tsx'

const from = '/data/projects/$projectId_/histories/$projectHistoryId'

export const Route = createFileRoute('/data/projects/$projectId_/histories/$projectHistoryId')({
  component: () => <ProjectHistoryCompare from={from} />,
})
