import { createFileRoute } from '@tanstack/react-router'

import { Check } from '../../../../../../../../../../formsAndLists/check/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check'

export const Route = createFileRoute(from)({
  component: () => (
    <Check from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check" />
  ),
})
