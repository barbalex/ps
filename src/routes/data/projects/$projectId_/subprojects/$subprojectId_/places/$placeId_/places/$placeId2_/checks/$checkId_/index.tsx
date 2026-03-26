import { createFileRoute } from '@tanstack/react-router'

import { CheckIndex } from '../../../../../../../../../../../../formsAndLists/check/Index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckIndex
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/"
      isRootRoute={true}
    />
  ),
})
