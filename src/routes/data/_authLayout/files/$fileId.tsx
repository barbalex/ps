import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../formsAndLists/file/index.tsx'

const from = '/data/_authLayout/files/$fileId'

export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return <File from={from} />
}
