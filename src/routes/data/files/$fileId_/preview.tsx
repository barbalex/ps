import { createFileRoute } from '@tanstack/react-router'

import { FilePreview } from '../../../../formsAndLists/filePreview/index.tsx'

const from = '/data/files/$fileId_/preview'

export const Route = createFileRoute(from)({
  component: () => <FilePreview from={from} />,
})
