import { createFileRoute } from '@tanstack/react-router'

import { SubprojectReports } from '../../../../../../../formsAndLists/subprojectReports.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/reports/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

const RouteComponent = () => {
  return (
    <SubprojectReports from="/data/projects/$projectId_/subprojects/$subprojectId_/reports/" />
  )
}
