import { createFileRoute } from '@tanstack/react-router'

import { CheckIndex } from '../../../../../../../../../../formsAndLists/check'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check" />
  ),
})
