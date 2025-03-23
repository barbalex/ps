import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../../../../../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/files/$fileId',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <File from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/files/$fileId" />
  )
}
