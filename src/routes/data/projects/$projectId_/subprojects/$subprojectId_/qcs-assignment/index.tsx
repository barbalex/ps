import { createFileRoute } from '@tanstack/react-router'
import { SubprojectQcs } from '../../../../../../../formsAndLists/subprojectQcsAssignment.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/qcs-assignment/'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/qcs-assignment/')({
  component: () => <SubprojectQcs from={from} />,
  notFoundComponent: NotFound,
})
