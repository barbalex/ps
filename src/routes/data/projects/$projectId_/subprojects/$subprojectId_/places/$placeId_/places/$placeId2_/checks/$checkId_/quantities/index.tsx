import { createFileRoute } from '@tanstack/react-router'

import { CheckQuantities } from '../../../../../../../../../../../../../formsAndLists/checkQuantities.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/quantities/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckQuantities from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/quantities/" />
  ),
  notFoundComponent: NotFound,
})
