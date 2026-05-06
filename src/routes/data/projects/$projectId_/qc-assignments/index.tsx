import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcAssignments } from '../../../../../formsAndLists/projectQcAssignments.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/qc-assignments/'

export const Route = createFileRoute('/data/projects/$projectId_/qc-assignments/')({
  component: () => <ProjectQcAssignments from={from} />,
  notFoundComponent: NotFound,
})
