import { createFileRoute } from '@tanstack/react-router'

import { FilePreview } from '../../../../../../../../../formsAndLists/filePreview/index.tsx'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/files/$fileId_/preview'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/files/$fileId_/preview',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <FilePreview from={from} />
}
