import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxa } from '../../../../../../../../../../formsAndLists/subprojectTaxa.tsx'
import { NotFound } from '../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/'

export const Route = createFileRoute(from)({
  component: () => (
    <SubprojectTaxa from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/taxa/" />
  ),
  notFoundComponent: NotFound,
})
