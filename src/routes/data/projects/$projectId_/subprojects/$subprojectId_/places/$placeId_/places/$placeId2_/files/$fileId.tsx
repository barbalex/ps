import { createFileRoute } from '@tanstack/react-router'

import { File } from '../../../../../../../../../../../formsAndLists/file/index.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/files/$fileId'

export const Route = createFileRoute(from)({
  component: () => (
    <File from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/files/$fileId" />
  ),
  notFoundComponent: NotFound,
})
