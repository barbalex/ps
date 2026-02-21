import { createFileRoute } from '@tanstack/react-router'

import { CheckValues } from '../../../../../../../../../../../../../formsAndLists/checkValues.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/values/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckValues from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/values/" />
  ),
  notFoundComponent: NotFound,
})
