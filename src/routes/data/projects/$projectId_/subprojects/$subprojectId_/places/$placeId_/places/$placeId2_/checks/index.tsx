import { createFileRoute } from '@tanstack/react-router'

import { Checks } from '../../../../../../../../../../../formsAndLists/checks.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/'

export const Route = createFileRoute(from)({
  component: () => (
    <Checks from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/" />
  ),
  notFoundComponent: NotFound,
})
