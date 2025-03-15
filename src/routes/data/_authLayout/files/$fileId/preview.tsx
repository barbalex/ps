import { createFileRoute } from '@tanstack/react-router'

import { FilePreview } from '../../../../../formsAndLists/filePreview/index.tsx'

const from = '/data/_authLayout/files/$fileId/preview'

export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return <FilePreview from={from} />
}
