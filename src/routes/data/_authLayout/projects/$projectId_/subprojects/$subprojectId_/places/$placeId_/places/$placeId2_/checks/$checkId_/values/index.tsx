import { createFileRoute } from '@tanstack/react-router'

import { CheckValues } from '../../../../../../../../../../../../../../../formsAndLists/checkValues.tsx'
import { NotFound } from '../../../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/values/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <CheckValues from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/values/" />
  )
}
