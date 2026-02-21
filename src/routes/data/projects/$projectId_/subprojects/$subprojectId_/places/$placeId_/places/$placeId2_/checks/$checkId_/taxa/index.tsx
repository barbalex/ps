import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxa } from '../../../../../../../../../../../../../formsAndLists/checkTaxa.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/taxa/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckTaxa from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/taxa/" />
  ),
  notFoundComponent: NotFound,
})
