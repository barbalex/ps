import { createFileRoute } from '@tanstack/react-router'

import { Check } from '../../../../../../../../../../formsAndLists/check/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Check level={1} from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId/" />
  )
}
