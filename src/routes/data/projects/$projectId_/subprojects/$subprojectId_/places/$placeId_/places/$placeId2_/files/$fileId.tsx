import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/files/$fileId',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <File from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/files/$fileId" />
  )
}
