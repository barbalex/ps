import { createFileRoute } from '@tanstack/react-router'

import { FilePreview } from '../../../../../../../../../../../../formsAndLists/filePreview/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/files/$fileId_/preview'

export const Route = createFileRoute(from)({
  component: () => (
    <FilePreview from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/files/$fileId_/preview" />
  ),
})
