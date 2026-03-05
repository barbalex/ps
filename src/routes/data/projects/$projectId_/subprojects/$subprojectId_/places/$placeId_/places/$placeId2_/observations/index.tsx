import { createFileRoute, useParams } from '@tanstack/react-router'

import { Observations } from '../../../../../../../../../../../formsAndLists/observations.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/observations/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId, subprojectId, placeId, placeId2 } = useParams({
      from,
    })

    return (
      <Observations
        projectId={projectId}
        subprojectId={subprojectId}
        placeId={placeId}
        placeId2={placeId2}
      />
    )
  },
  notFoundComponent: NotFound,
})
