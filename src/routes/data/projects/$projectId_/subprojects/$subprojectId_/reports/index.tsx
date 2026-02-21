import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReports } from '../../../../../../../formsAndLists/subprojectReports.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'
const from = '/data/projects/$projectId_/subprojects/$subprojectId_/reports/'

export const Route = createFileRoute(from)({
  component: () => (
    <SubprojectReports from="/data/projects/$projectId_/subprojects/$subprojectId_/reports/" />
  ),
  notFoundComponent: NotFound,
})
