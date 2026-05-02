import { createFileRoute } from '@tanstack/react-router'

import { Checks } from '../../../../../../../../../formsAndLists/checks.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/')({
  component: () => (
    <Checks from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/" />
  ),
  notFoundComponent: NotFound,
})
