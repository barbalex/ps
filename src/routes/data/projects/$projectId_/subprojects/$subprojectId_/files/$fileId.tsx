import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/files/$fileId'

export const Route = createFileRoute(from)({
  component: () => (
    <File from="/data/projects/$projectId_/subprojects/$subprojectId_/files/$fileId" />
  ),
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.fileId || params.fileId === 'undefined') {
      throw new Error('Invalid or missing fileId in route parameters')
    }
    return {
      navDataFetcher: 'useFileNavData',
    }
  },
})
