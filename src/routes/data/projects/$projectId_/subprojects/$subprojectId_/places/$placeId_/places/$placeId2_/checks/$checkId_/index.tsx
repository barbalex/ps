import { createFileRoute } from '@tanstack/react-router'

import { CheckList } from '../../../../../../../../../../../../formsAndLists/check/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckList from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/" />
  ),
})
