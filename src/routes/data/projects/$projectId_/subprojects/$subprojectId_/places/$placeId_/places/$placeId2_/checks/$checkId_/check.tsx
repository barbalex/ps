import { createFileRoute } from '@tanstack/react-router'

import { CheckIndex } from '../../../../../../../../../../../../formsAndLists/check'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/check')({
  component: () => (
    <CheckIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/check" />
  ),
})
