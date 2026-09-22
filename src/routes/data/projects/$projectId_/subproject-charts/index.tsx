import { createFileRoute } from '@tanstack/react-router'

import { Charts } from '../../../../../formsAndLists/charts.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subproject-charts/',
)({
  component: () => <Charts forSubprojects section="subproject-charts" />,
  notFoundComponent: NotFound,
})
