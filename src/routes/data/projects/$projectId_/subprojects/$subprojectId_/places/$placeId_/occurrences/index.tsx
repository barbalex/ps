import { createFileRoute, useParams } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/occurrences/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId, subprojectId, placeId } = useParams({
      from,
    })
    return (
      <Occurrences
        projectId={projectId}
        subprojectId={subprojectId}
        placeId={placeId}
      />
    )
  },
  notFoundComponent: NotFound,
})
