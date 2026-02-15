import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/$fileId',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (!params.actionId || params.actionId === 'undefined') {
      throw new Error('Invalid or missing actionId in route parameters')
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
