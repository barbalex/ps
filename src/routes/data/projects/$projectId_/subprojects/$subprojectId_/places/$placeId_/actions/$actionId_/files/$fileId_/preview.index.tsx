import { createFileRoute } from '@tanstack/react-router'

import { FilePreview } from '../../../../../../../../../../../../formsAndLists/filePreview'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/$fileId_/preview/')({
  component: () => (
    <FilePreview from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/$fileId_/preview/" />
  ),
})
