import { createFileRoute, useParams } from '@tanstack/react-router'

import { Files } from '../../../../../../../../../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/files/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId, subprojectId, placeId, actionId } = useParams({
      from,
    })

    return (
      <Files
        projectId={projectId}
        subprojectId={subprojectId}
        placeId={placeId}
        actionId={actionId}
      />
    )
  },
  notFoundComponent: NotFound,
})
