import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../formsAndLists/file'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/files/$fileId')({
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
