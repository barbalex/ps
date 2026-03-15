import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '../../../../../../../../../components/NotFound.tsx'
import { RouteComponent } from './-component.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/observations/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
