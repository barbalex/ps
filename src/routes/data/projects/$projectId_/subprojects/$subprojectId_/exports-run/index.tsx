import { createFileRoute } from '@tanstack/react-router'

import { SubprojectExportsRun } from '../../../../../../../formsAndLists/subprojectExportsRun.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/exports-run/'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/exports-run/',
)({
  component: () => <SubprojectExportsRun from={from} />,
  notFoundComponent: NotFound,
})
