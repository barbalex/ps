import { createFileRoute } from '@tanstack/react-router'

import { Places } from '../../../../../../../formsAndLists/places.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'
const from = '/data/projects/$projectId_/subprojects/$subprojectId_/places/'

export const Route = createFileRoute(from)({
  component: () => (
    <Places from="/data/projects/$projectId_/subprojects/$subprojectId_/places/" />
  ),
  notFoundComponent: NotFound,
})
