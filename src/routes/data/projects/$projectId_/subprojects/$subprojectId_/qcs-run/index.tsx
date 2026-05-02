import { createFileRoute } from '@tanstack/react-router'

import { SubprojectQcsRun } from '../../../../../../../formsAndLists/subprojectQcsRun.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/qcs-run/'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/qcs-run/')({
  component: () => <SubprojectQcsRun from={from} />,
  notFoundComponent: NotFound,
})
