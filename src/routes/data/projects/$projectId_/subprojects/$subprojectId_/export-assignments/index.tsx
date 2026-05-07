import { createFileRoute } from '@tanstack/react-router'

import { SubprojectExportAssignments } from '../../../../../../../formsAndLists/subprojectExportAssignments.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/export-assignments/'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/export-assignments/',
)({
  component: () => <SubprojectExportAssignments from={from} />,
  notFoundComponent: NotFound,
})
