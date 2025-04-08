import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

const from = '/data/_authLayout/files/$fileId'

export const Route = createFileRoute(from)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useFileNavData',
  }),
})

function RouteComponent() {
  return <File from={from} />
}
