import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

const from = '/data/files/$fileId'

export const Route = createFileRoute(from)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.fileId || params.fileId === 'undefined') {
      throw new Error('Invalid or missing fileId in route parameters')
    }
    return {
      navDataFetcher: 'useFileNavData',
    }
  },
})

function RouteComponent() {
  return <File from={from} />
}
