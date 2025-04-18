import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/files/$fileId',
)({
  component: File,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useFileNavData',
  }),
})
