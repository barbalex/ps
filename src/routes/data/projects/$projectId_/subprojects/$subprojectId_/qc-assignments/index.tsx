import { createFileRoute } from '@tanstack/react-router'
import { SubprojectQcAssignments } from '../../../../../../../formsAndLists/subprojectQcAssignments.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/qc-assignments/'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/qc-assignments/')({
  component: () => <SubprojectQcAssignments from={from} />,
  notFoundComponent: NotFound,
})
