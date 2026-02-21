import { createFileRoute } from '@tanstack/react-router'

import { ActionReports } from '../../../../../../../../../../../formsAndLists/actionReports.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionReports from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/" />
  ),
  notFoundComponent: NotFound,
})
