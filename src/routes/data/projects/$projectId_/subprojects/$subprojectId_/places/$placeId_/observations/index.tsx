import { createFileRoute, useParams } from '@tanstack/react-router'

import { Observations } from '../../../../../../../../../formsAndLists/observations.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/observations/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId, subprojectId, placeId } = useParams({
      from,
    })
    return (
      <Observations
        projectId={projectId}
        subprojectId={subprojectId}
        placeId={placeId}
      />
    )
  },
  notFoundComponent: NotFound,
})
