import { createFileRoute } from '@tanstack/react-router'

import { Check } from '../../../../../../../../../../../../formsAndLists/check/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/check',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Check from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/check" />
  )
}
