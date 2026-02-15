import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/$fileId',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.placeId_ || params.placeId_ === 'undefined') {
      throw new Error('Invalid or missing placeId_ in route parameters')
    }
    if (!params.actionId_ || params.actionId_ === 'undefined') {
      throw new Error('Invalid or missing actionId_ in route parameters')
    }
    if (!params.fileId || params.fileId === 'undefined') {
      throw new Error('Invalid or missing fileId in route parameters')
    }
    return {
    navDataFetcher: 'useFileNavData',
  }
  },
})

function RouteComponent() {
  return (
    <File from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/$fileId" />
  )
}
