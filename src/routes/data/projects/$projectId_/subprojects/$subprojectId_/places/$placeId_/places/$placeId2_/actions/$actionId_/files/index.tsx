import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'
import { RouteComponent } from './-component.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/files/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
