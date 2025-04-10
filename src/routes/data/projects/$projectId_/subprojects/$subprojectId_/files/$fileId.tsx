import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/files/$fileId',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useFileNavData',
  }),
})

const RouteComponent = () => {
  return (
    <File from="/data/projects/$projectId_/subprojects/$subprojectId_/files/$fileId" />
  )
}
