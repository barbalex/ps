import { createFileRoute } from '@tanstack/react-router'

import { Actions } from '../../../../../../../../../formsAndLists/actions.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/')({
  component: () => (
    <Actions from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/" />
  ),
  notFoundComponent: NotFound,
})
