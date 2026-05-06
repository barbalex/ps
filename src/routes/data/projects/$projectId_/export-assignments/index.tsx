import { createFileRoute } from '@tanstack/react-router'

import { ProjectExportAssignments } from '../../../../../formsAndLists/projectExportAssignments.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/export-assignments/'

export const Route = createFileRoute('/data/projects/$projectId_/export-assignments/')({
  component: () => <ProjectExportAssignments from={from} />,
  notFoundComponent: NotFound,
})
