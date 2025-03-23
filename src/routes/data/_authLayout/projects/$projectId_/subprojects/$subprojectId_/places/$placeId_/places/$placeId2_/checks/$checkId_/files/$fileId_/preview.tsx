import { createFileRoute } from '@tanstack/react-router'

import { FilePreview } from '../../../../../../../../../../../../../../../../formsAndLists/filePreview/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/files/$fileId_/preview',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <FilePreview from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/files/$fileId_/preview" />
  )
}
